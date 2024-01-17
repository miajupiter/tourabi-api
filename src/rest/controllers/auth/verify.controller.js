const userDbHelper = require('../../../db/helpers/userdb-helper')

module.exports = (req) =>
	new Promise((resolve, reject) => {
		let username = req.body.username || req.query.username || ''
		let authCode = req.body.authCode || req.query.authCode || ''
		let deviceId = req.body.deviceId || req.query.deviceId || ''

		authCode = authCode
			.replaceAll(' ', '')
			.replaceAll('-', '')
			.replaceAll('.', '')

		if (username.trim() == '') return reject('username required')
		if (!username.includes('@') && !username.startsWith('+') && !isNaN(username)) {
			username = `+${username}`
		}

		if (authCode.trim() == '') return reject('auth code required')


		db.authCodes.find({ username: username, authCode: authCode, passive: false })
			.sort({ _id: -1 })
			.limit(1)
			.then((docs) => {
				if (docs.length > 0) {
					if (docs[0].authCodeExpire.getTime() < new Date().getTime())
						return reject('auth code expired')
					if (docs[0].verified)
						return reject('auth code has already been verified')
					docs[0].verified = true
					docs[0].verifiedDate = new Date()
					docs[0].save().then((doc2) => {
						db.members
							.findOne({ username: doc2.username })
							.then(memberDoc => {
								if (memberDoc == null) {
									memberDoc = new db.members({
										username: doc2.username,
										password: doc2.password,
										passive: false,
										role: 'user',
										credentialType: ''
									})
									if (util.isValidTelephone(memberDoc.username))
										memberDoc.credentialType = 'sms'
									if (util.isValidEmail(memberDoc.username))
										memberDoc.credentialType = 'email'
								}
								memberDoc
									.save()
									.then(memberDoc2 => {
										resolve(`verification was successful ${memberDoc2._id} username:${memberDoc2.username}`)
									})
									.catch(reject)
							})
							.catch(reject)
					})
						.catch(reject)
				} else {
					reject('verification failed')
				}
			})
			.catch(reject)
	})
