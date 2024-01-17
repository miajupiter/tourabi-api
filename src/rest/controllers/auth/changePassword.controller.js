module.exports = (req) =>
  new Promise((resolve, reject) => {
    if (req.method === 'POST') {
      let username = req.body.username || req.query.username || ''
      let oldPassword = req.body.oldPassword || req.query.oldPassword || ''
      let newPassword = req.body.newPassword || req.query.newPassword || ''
      if (oldPassword == '') return reject('old password required')
      if (newPassword == '') return reject('new password required')

      if (username.trim() == '') return reject('username required')
      if (!username.includes('@') && !username.startsWith('+') && !isNaN(username)){
        username = `+${username}`
      }

      db.members
        .findOne({ username: username, password: oldPassword })
        .then((memberDoc) => {
          if (memberDoc) {
            memberDoc.password = newPassword
            memberDoc
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
