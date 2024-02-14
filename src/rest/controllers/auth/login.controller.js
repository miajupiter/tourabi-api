

const { saveSession } = require('./helper')
module.exports = (req) =>
	new Promise((resolve, reject) => {
		if (req.method != 'POST')
			return restError.method(req, reject)
		// console.log('req.body',req.body)
		// let username = req.getValue('username')
		let email = req.getValue('email')
		let password = req.getValue('password')
		let deviceId = req.getValue('deviceId')

		// if (!(username || email || phone))
		// return reject(`One of email, phone, username required.`)

		if (!(email)) return reject(`email required`)
		if (!password) return reject('password required')

		login(email, password,deviceId)
			.then((userDoc) => {
				saveSession(userDoc, req).then(resp=>{
					console.log('resp:',resp)
					resolve(resp)
				}).catch(err=>{
					console.log('session err:',err)
					reject(err)
				})
			})
			.catch(err=>{
				console.log('login err:',err)
				reject(err)
			})

	})


function login(email, password, deviceId) {
	return new Promise((resolve, reject) => {
		db.users
			.findOne({ email: email, password: password })
			.then((doc) => {
				if (doc == null) {
					reject(`login failed`)
				} else if (doc.passive) {
					reject(`user is not active`)
				} else {
					resolve(doc)
				}
			})
			.catch(reject)
	})
}
