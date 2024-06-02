const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(receiverEmail, subject, text) {
    const { data, error } = await resend.emails.send({
      from: 'Yousef <yousef@email.bestphysicsproject.com>',
      to: [receiverEmail],
      subject: subject,
      text: text,
    });
  
    if (error) {
      return console.error({ error });
    }
  
    console.log({ data });
  }

module.exports = sendEmail;
