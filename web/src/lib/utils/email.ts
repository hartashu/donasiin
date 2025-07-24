import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1 style="color: #333;">Email Verification</h1>
        <p style="font-size: 18px; color: #555;">Your verification code is:</p>
        <p style="font-size: 36px; font-weight: bold; color: #333; letter-spacing: 5px; margin: 20px 0; background-color: #f0f0f0; padding: 10px 20px; border-radius: 8px;">
          ${code}
        </p>
        <p style="font-size: 14px; color: #777;">This code will expire in 15 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetLink = `${process.env.AUTH_URL}/auth/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}