const { Resend } = require('resend');

const resend = new Resend("re_YggLfzeu_zuwJ9ChYZKQmCJsvMvE9aWoR");

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
