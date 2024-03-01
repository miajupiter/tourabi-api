const auth = require('../../../lib/auth')
const { v4 } = require('uuid')

exports.saveSession = async function (userDoc, req) {
	const deviceId = req.getValue('deviceId')
	try {
		await db.sessions.deleteMany(
			{
				$or: [
					{ userId: userDoc._id, deviceId: deviceId },
					{ expires: { $lt: new Date() } }
				]
			},
			{ multi: true }
		)
	} catch { }

	return new Promise(async (resolve, reject) => {
		// let oldDbId = null
		let sessionDoc = new db.sessions({
			userId: userDoc._id,
			sessionToken: v4(),
			expires: new Date(new Date().setSeconds(new Date().getSeconds() + Number(process.env.JWT_TOKEN_EXPIRES_IN)))
		})

		sessionDoc
			.save()
			.then((newDoc) => {
				let obj = {
					user: userDoc.toJSON(),
					token: auth.sign({ sessionToken: newDoc.sessionToken }),
				}
				delete obj.user.password
				resolve(obj)
			})
			.catch(reject)
	})
}