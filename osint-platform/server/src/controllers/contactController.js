import nodemailer from 'nodemailer';
import ContactModel from '../models/Contact.js';

export async function sendContactEmail(req, res) {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  let record;
  try {
    record = await ContactModel.create({ name, email, message });
  } catch (err) {
    console.error('Failed to persist contact submission:', err.message);
    return res.status(500).json({ message: 'Could not send message. Please try again later.' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const contactEmail = process.env.CONTACT_EMAIL || 'SentryScope@hi2.in';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 587,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: smtpUser,
        to: contactEmail,
        subject: `New contact form submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: system-ui, sans-serif; color: #111;">
            <h2>New contact form submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        `,
      });
    } catch (err) {
      // The submission is already saved, so don't fail the request just
      // because the notification email didn't go out — log it and move on.
      console.error('Contact email send failed:', err.message);
    }
  } else {
    console.log(`[Contact Form] ${record.createdAt.toISOString()} | ${name} <${email}> | ${message}`);
  }

  return res.status(201).json({ message: 'Message received. We will get back to you shortly.', id: record._id.toString() });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Admin-only: list submitted contact messages. Gated by requireAuth +
// requireAdmin in contactRoutes.js.
export async function getContactMessages(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ContactModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactModel.countDocuments(),
    ]);

    res.json({
      messages: items.map((item) => item.toPublicJSON()),
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load contact messages.' });
  }
}
