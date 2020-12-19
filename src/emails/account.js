const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'landauvlad@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app!, ${name}. Let me know how you get along with the app.`
    })
}

const sendEmailOnDelete = (email, name) => {
    sgMail.send({
        to: email,
        from: 'landauvlad@gmail.com',
        subject: 'We are sad to see you go',
        text: `Dear ${name}, We are sad to see you leave, We would appriciate if you could let us know on how to improve our services.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendEmailOnDelete
}