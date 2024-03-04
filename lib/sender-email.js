const axios = require('axios')
const nodemailer = require('nodemailer')

exports.sendEmail = function (email, subject, msg) {
  return new Promise(async (resolve, reject) => {
    let transporter = createTransporter()

    transporter.sendMail({
      from:process.env.MAIL_FROM || "TourAbi <tourabi@tourabi.net>" ,
      to: email,
      subject: subject,
      text: msg,
    })
      .then(result => {
        console.log(result.response)
        resolve()
      })
      .catch(err => {

        reject(err)
      })
  })
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
    port: process.env.MAIL_PORT || 587,
    // secure: false, // true for 465, false for other ports
    secure: process.env.MAIL_SECURE === 'true' ? true : false,
    auth: {
      user: process.env.MAIL_AUTH_USER, // generated ethereal user
      pass: process.env.MAIL_AUTH_PASS, // generated ethereal password
    },
  })
}