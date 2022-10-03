const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //  Create a transporter: Service that senf the email
  // USING gmail as mail transporter does is not the best solution
  //   using sendGrid or mail Gun
  // Use mailtrap form dev
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const emailOptions = {
    from: 'Sirri Celles <sirri@kiddle.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };

  // Sent the email with nodemailer
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
