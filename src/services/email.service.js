require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    text: '',
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activation account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Reset password' });
}

function sendEmailChangeToken(email, token) {
  const href = `${process.env.CLIENT_HOST}/change-email/${token}`;
  const html = `
    <h1>Зміна email</h1>
    <p>Хтось намагається змінити вашу електронну пошту. Якщо це не ви — нічого не робіть.
    Якщо це ви — підтвердьте зміну, перейшовши за посиланням:</p>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Підтвердження зміни email' });
}

const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangeToken,
};

module.exports = {
  emailService,
};
