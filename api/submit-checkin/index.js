const sg = require('@sendgrid/mail');

module.exports = async function (context, req) {
  try {
    const b = req.body || {};
    if (b.type !== 'checkin' || !b.pid || !b.weekStart) {
      context.res = { status: 400, body: 'Bad payload' };
      return;
    }
    sg.setApiKey(process.env.SENDGRID_API_KEY);
    const toEmail   = process.env.TO_EMAIL;   // e.g. cxr-eval-intake@nhs.scot
    const fromEmail = process.env.FROM_EMAIL; // verified sender in SendGrid
    const json = JSON.stringify(b, null, 2);
    const subject = `CHECKIN | PID:${b.pid} | ${b.weekStart}`;
    await sg.send({
      to: toEmail, from: fromEmail, subject, text: 'See attached JSON.',
      attachments: [{ content: Buffer.from(json).toString('base64'), filename: `checkin_${b.pid}_${b.weekStart}.json`, type: 'application/json', disposition: 'attachment' }]
    });
    context.res = { status: 200, body: 'OK' };
  } catch (e) {
    context.log('ERR', e);
    context.res = { status: 500, body: 'Email failed' };
  }
};
