import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendFinalizeRegistrationEmail = async (to: string, token: string) => {
  const verificationLink = `${process.env.AUTH_URL}/auth/verify/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Complete Your Registration',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Welcome! Please Verify Your Email</h2>
        <p>Thanks for signing up. Please click the link below to complete your registration:</p>
        <a href="${verificationLink}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Complete Registration
        </a>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export async function sendPasswordResetEmail(to: string, token: string, source?: string) {
  let resetLink = `${process.env.AUTH_URL}/auth/reset-password/${token}`;

  if (source === 'native') {
    resetLink += '?from=native';
  }

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
};



export const sendShippingNotificationEmail = async (to: string, postTitle: string, trackingCode: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `Your requested item "${postTitle}" has been shipped!`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Item Shipped!</h2>
        <p>Good news! The item you requested, <strong>${postTitle}</strong>, has been shipped by the donor.</p>
        <p>You can track your package with the following tracking code:</p>
        <div style="background-color: #f2f2f2; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 1.2em; letter-spacing: 2px;">${trackingCode}</strong>
        </div>
        <p>Please remember to mark the item as 'Completed' in your profile once you receive it.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};