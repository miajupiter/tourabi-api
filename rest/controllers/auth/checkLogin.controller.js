module.exports = (req) =>
	new Promise((resolve, reject) => {
		if (req.method == 'POST') {
			let email = req.getValue('email');
			if (!email) return reject('email required')

			checkEmail(email).then(resolve).catch(reject)

		} else restError.method(req, reject)

	})

function checkEmail(email) {
	return new Promise((resolve, reject) => {
		db.users
			.findOne({ email: email })
			.then((doc) => {
				if (doc == null) {
					reject(`user not found`)
				} else if (doc.passive) {
					reject(`user is not active`)
				} else {
					resolve()
				}
			})
			.catch(reject)
	})
}
