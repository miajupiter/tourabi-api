const { permissionType } = require('../../../db/helpers/db-types')
const auth=require('../../../lib/auth')
exports.saveSession=async function(userDoc, req, socialCredentials={}) {
	let deviceId = req.body.deviceId || req.query.deviceId || req.headers.deviceId || ''
	let oldSessions = []
	try {
		oldSessions = await db.sessions
			.find({ member: userDoc._id })
			.sort({ _id: -1 })
			.limit(1)

		db.sessions.updateMany(
			{ member: userDoc._id, username:userDoc.username, deviceId: deviceId, closed: false },
			{ $set: { closed: true } },
			{ multi: true }
		)
	} catch {}

	return new Promise(async (resolve, reject) => {
		// let oldDbId = null
		let sessionDoc = new db.sessions({
			member: userDoc._id,
			username: userDoc.username,
			role: userDoc.role,
			deviceId: deviceId,
			IP: req.IP || '',
			lastIP: req.IP || '',
			closed: false,
			language: 'tr',
			requestHeaders: req.headers,
      socialCredentials:socialCredentials,
			permissions: util.clone(permissionType),
		})
		if (oldSessions.length > 0) {
			sessionDoc.language = oldSessions[0].language
		}
		

		sessionDoc
			.save()
			.then((newDoc) => {
				let obj = {
					sessionId: newDoc._id.toString(),
				}
				console.log(`obj:`,obj)
				resolve(auth.sign(obj))
			})
			.catch(reject)
	})
}