const sender = require('../../../lib/sender')
const { saveSession } = require('./helper')

module.exports = (req) =>
	new Promise(async (resolve, reject) => {
		if (req.method == 'POST') {
			let data = req.body
			if (!data.user) return reject(`data does not have 'user' object`)

			const email = data.user.email
			let memberDoc = await db.members.findOne({ username: email })
			if (!memberDoc) {
				memberDoc = new db.members({
					username: email,
					password: '',
					name: data.user.name,
					credentialType: data.account.provider,
					role: 'user',
					passive: false,
					image: data.user.image
				})
				memberDoc.save()
					.then(newMemberDoc => {
						saveSession(newMemberDoc, req, data)
							.then(resolve)
							.catch(reject)
					})
					.catch(reject)
			} else {
				saveSession(memberDoc, req, data)
					.then(resolve)
					.catch(reject)
			}

		} else {
			restError.method(req, reject)
		}
	})
