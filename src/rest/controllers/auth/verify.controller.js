const userDbHelper = require('../../../db/helpers/userdb-helper')

module.exports = (req) =>
	new Promise(async (resolve, reject) => {
		try {
			let email = req.getValue('email')
			let authCode = req.getValue('authCode')
			let deviceId = req.getValue('deviceId')

			if (email.trim() == '') return reject('email required')

			if (authCode.trim() == '') return reject('authCode required')

			const docs = await db.authCodes
				.find({ email: email, deviceId: deviceId, authCode: authCode })
				.sort({ _id: -1 })
				.limit(1)
			if (docs.length == 0) return reject('verification failed')

			const authDoc = docs[0]
			if (authDoc.authCodeExpire.getTime() < new Date().getTime())
				return reject('auth code expired')
			if (authDoc.verified)
				return reject('auth code has already been verified')

			let userDoc = await db.users.findOne({ email: authDoc.email })

			if (userDoc == null) {
				userDoc = new db.users({
					...authDoc.userInfo,
					email: authDoc.email,
					passive: false,
					role: 'user'
				})
			}
			if (!epValidateSync(userDoc, reject)) return
			authDoc.verified = true
			authDoc.verifiedDate = new Date()
			await authDoc.save()
			const newUserDoc = await userDoc.save()
			resolve(`verification was successful ${newUserDoc._id} email:${newUserDoc.email}`)

		} catch (err) {
			reject(err)
		}
	})
