const sender = require('../../../lib/sender')
module.exports = (req) =>
  new Promise((resolve, reject) => {
    if (req.method === 'POST') {
      let email = req.body.email
      if (!email) return reject('email required')


      db.users
        .findOne({ email: email })
        .then((userDoc) => {
          if (userDoc) {
            sender
              .sendForgotPasswordEmail(userDoc.email, userDoc.password)
              .then(resolve)
              .catch(reject)
          } else {
            reject('user not found')
          }
        })
        .catch(reject)
    } else restError.method(req, reject)
  })
