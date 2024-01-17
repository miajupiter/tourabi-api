const sender = require('../../../lib/sender')

module.exports = (req) =>
	new Promise(async (resolve, reject) => {
		if (req.method == 'POST') {
			let username = req.body.username || req.query.username || ''
      let password = req.body.password || req.query.password || ''
      let deviceId = req.body.deviceId || req.query.deviceId || ''

			if (username.trim() == '') return reject('username required')
      if (!username.includes('@') && !username.startsWith('+') && !isNaN(username)){
        username = `+${username}`
      }

			if (password == '')	return reject('password required')
			
			db.members
				.findOne({ username: username })
				.then((memberDoc) => {
					if (!memberDoc) {
						db.authCodes
							.updateMany(
								{ username: username, verified: false, passive: false },
								{ $set: { passive: true } },
								{ multi: true }
							)
							.then(() => {
								let newAuthDoc = new db.authCodes({
									username: username,
									password: password,
									authCode: '893050', //qwerty util.randomNumber(120000, 998000).toString(),
									authCodeExpire: new Date(
										new Date().setSeconds(
											new Date().getSeconds() +
												Number(process.env.AUTHCODE_EXPIRE || 180)
										)
									),
									deviceId: deviceId,
									verified: false, 
									passive: false,
								})
								newAuthDoc
									.save()
									.then((newAuthDoc2) => {
										if (util.isValidTelephone(newAuthDoc2.username)) {
											sender
												.sendAuthSms(newAuthDoc2.username, newAuthDoc2.authCode)
												.then(()=>resolve(`username:${newAuthDoc2.username} authCode:${newAuthDoc2.authCode} /auth/verify icin kullanilacak.`))
												.catch(reject)
										} else if (util.isValidEmail(newAuthDoc2.username)) {
											sender
												.sendAuthEmail(newAuthDoc2.username, newAuthDoc2.authCode)
												.then(()=>resolve(`username:${newAuthDoc2.username} authCode:${newAuthDoc2.authCode} /auth/verify icin kullanilacak.`))
												.catch(reject)
										} else {
											
											resolve(`username:${newAuthDoc2.username} authCode:${newAuthDoc2.authCode} /auth/verify icin kullanilacak.`)
										}
									})
									.catch(reject)
							})
							.catch(reject)
					} else {
						reject('User already exists')
					}
				})
				.catch(reject)
		} else {
			restError.method(req, reject)
		}
	})
