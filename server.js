require('dotenv').config();
const express         = require('express');
const { Firestore }   = require('@google-cloud/firestore');
const nodemailer      = require('nodemailer');
const path            = require('path');

const app      = express();
const db       = new Firestore({
  projectId:  process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'subzillo-website-prod',
  databaseId: process.env.FIRESTORE_DATABASE  || 'default',
});
const waitlist = db.collection('waitlist');

// ── SMTP transporter ──────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT  || '465'),
  secure: (process.env.SMTP_SECURE || 'true') === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── POST /api/waitlist ─────────────────────────────────────────
app.post('/api/waitlist', async (req, res) => {
  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const safeEmail = String(email).trim().toLowerCase();

  // Duplicate check
  try {
    const existing = await waitlist.where('email', '==', safeEmail).limit(1).get();
    if (!existing.empty) {
      return res.json({ success: true, already: true });
    }
  } catch (err) {
    console.error('Firestore read error:', err.message);
    return res.status(500).json({ error: 'Could not save — please try again' });
  }

  // Save to Firestore
  try {
    await waitlist.add({
      email:     safeEmail,
      ip:        req.ip        || null,
      referrer:  req.headers.referer || null,
      createdAt: new Date().toISOString(),
      notified:  false,
    });
  } catch (err) {
    console.error('Firestore write error:', err.message);
    return res.status(500).json({ error: 'Could not save — please try again' });
  }

  // Total count for the email subject line
  const snapshot = await waitlist.get();
  const total    = snapshot.size;

  // Email notification to info@subzillo.com
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter.sendMail({
      from:    `"Subzillo" <${process.env.SMTP_USER}>`,
      to:      'info@subzillo.com',
      subject: `🚀 Waitlist signup #${total} — ${safeEmail}`,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#07040F;padding:40px;max-width:560px;margin:0 auto;border-radius:16px">
          <div style="background:linear-gradient(135deg,#A719DD,#4489EB);border-radius:12px;padding:22px 28px;margin-bottom:28px">
            <h2 style="margin:0;font-size:20px;color:#fff;font-weight:800">New Waitlist Signup 🎉</h2>
            <p  style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75)">Subzillo Early Access</p>
          </div>
          <p style="font-size:13px;color:rgba(244,241,251,0.55);margin:0 0 8px">Email address</p>
          <p style="font-size:19px;font-weight:700;color:#fff;background:rgba(255,255,255,0.06);padding:14px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);margin:0 0 24px">${safeEmail}</p>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;text-align:center">
            <div style="font-size:32px;font-weight:800;color:#A719DD">#${total}</div>
            <div style="font-size:12px;color:rgba(244,241,251,0.4);margin-top:2px">total signups</div>
          </div>
          <p style="font-size:11px;color:rgba(244,241,251,0.25);margin-top:24px;text-align:center">
            ${new Date().toLocaleString('en-GB',{timeZone:'Asia/Dubai',dateStyle:'medium',timeStyle:'short'})} Gulf time
          </p>
        </div>
      `,
    }).catch(err => console.error('Email failed:', err.message));
  }

  res.json({ success: true });
});

// ── GET /api/waitlist/count (public) ──────────────────────────
app.get('/api/waitlist/count', async (_req, res) => {
  const snapshot = await waitlist.get();
  res.json({ count: snapshot.size });
});

// ── GET /api/waitlist/export (admin-protected CSV) ────────────
app.get('/api/waitlist/export', async (req, res) => {
  if (!process.env.ADMIN_TOKEN || req.headers['x-admin-token'] !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const snapshot = await waitlist.orderBy('createdAt', 'desc').get();
  const csv = [
    'id,email,ip,joined_at',
    ...snapshot.docs.map(doc => {
      const d = doc.data();
      return `"${doc.id}","${d.email}","${d.ip || ''}","${d.createdAt}"`;
    }),
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="subzillo-waitlist.csv"');
  res.send(csv);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n  ✦ Subzillo server  →  http://localhost:${PORT}`);
  console.log(`  ✦ Firestore DB     →  collection: waitlist`);
  console.log(`  ✦ Export CSV       →  GET /api/waitlist/export  (x-admin-token header)\n`);
});
