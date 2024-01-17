const { saveSession } = require('./helper')

module.exports = (req) =>
	new Promise((resolve, reject) => {
		if (req.method == 'POST') {
			let username = req.body.username || req.query.username || req.headers.username || ''
			let password = req.body.password || req.query.password || req.headers.password || ''
			let deviceId = req.body.deviceId || req.query.deviceId || req.headers.deviceId || ''
			if (username.trim() == '') return reject('username required')
			if (!username.includes('@') && !username.startsWith('+') && !isNaN(username)) {
				username = `+${username}`
			}
			if (password == '') return reject('password required')

			login(username, password)
				.then((userDoc) => saveSession(userDoc, req).then(resolve).catch(reject))
				.catch(reject)
		} else {
			restError.method(req, reject)
		}
	})


function login(username, password) {
	return new Promise(async (resolve, reject) => {
		if (password) {
			const doc = await db.members.findOne({ username: username, password: password })
			if (doc) {
				if (!doc.passive)
					resolve(doc)
				else reject(`user is not active`)
			} else reject('login failed')
		} else reject('password is required')
	})
}



