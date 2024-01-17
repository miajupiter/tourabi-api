const sender = require('../../../lib/sender')
module.exports = (req) =>
  new Promise((resolve, reject) => {
    if (req.method === 'POST') {
      let username = req.params.param1 || req.body.username || req.query.username || ''
      if (username.trim() == '') return reject('username required')
      if (!username.includes('@') && !username.startsWith('+') && !isNaN(username)) {
        username = `+${username}`
      }

      db.members
        .findOne({ username: username })
        .then((memberDoc) => {
          if (memberDoc) {
            if (util.isValidTelephone(memberDoc.username)) {
              
              sender
                .sendForgotPasswordSms(memberDoc.username, memberDoc.password)
                .then(resolve)
                .catch(reject)
            } else if (util.isValidEmail(memberDoc.username)) {
              if (memberDoc.credentialType == 'email') {
                sender
                  .sendForgotPasswordEmail(memberDoc.username, memberDoc.password)
                  .then(resolve)
                  .catch(reject)
              }else{
                reject(`credential type is not email`)
              }
            } else {
              resolve()
            }
          } else {
            reject('user not found')
          }
        })
        .catch(reject)
    } else restError.method(req, reject)
  })
