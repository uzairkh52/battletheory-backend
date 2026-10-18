const nodemailer = require('nodemailer');

const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.',
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Battle Theory Comms" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL || 'uzairkh52@gmail.com',
      replyTo: email,
      subject: `[BATTLE THEORY COMMS] ${subject || 'New Inquiry'} - From: ${name}`,
      html: `
        <div style="background-color: #0b0f19; color: #ffffff; font-family: monospace; padding: 20px; border: 1px solid #f59e0b;">
          <h2 style="color: #f59e0b;">[ SECURE TRANSMISSION RECEIVED ]</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #111827; padding: 10px; border-left: 3px solid #f59e0b;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Briefing transmission delivered successfully.',
    });
  } catch (error) {
    console.error('Contact Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deliver message.',
      error: error.message,
    });
  }
};

module.exports = { sendContactMessage };