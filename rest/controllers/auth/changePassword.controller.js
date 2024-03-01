module.exports = (req) =>
  new Promise((resolve, reject) => {
    if (req.method === 'POST') {
      let email = req.getValue('email')
      let oldPassword = req.getValue('oldPassword')
      let newPassword = req.getValue('newPassword')
      if (!oldPassword) return reject('old password required')
      if (!newPassword) return reject('new password required')

      if (!email) return reject('email required')

      db.users
        .findOne({ email: email, password: oldPassword })
        .then((userDoc) => {
          if (userDoc) {
            userDoc.password = newPassword
            userDoc
              .save()
              .then(() =>
                resolve('your password has been successfully changed.')
              )
              .catch(reject)
          } else {
            reject('old password failed')
          }
        })
        .catch(reject)
    } else restError.method(req, reject)
  })
