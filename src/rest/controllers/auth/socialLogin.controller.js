const sender = require('../../../lib/sender')
const { saveSession } = require('./helper')

module.exports = (req) =>
	new Promise(async (resolve, reject) => {
		if (req.method == 'POST') {
			let data = req.body
			if (!data.email) return reject(`data does not have 'email' object`)
			console.log(`data:`,data)
			const email = data.email
			let memberDoc = await db.members.findOne({ username: email })
			if (!memberDoc) {
				memberDoc = new db.members({
					username: email,
					password: '',
					name: data.name,
					credentialType: data.provider,
					role: 'user',
					passive: false,
					image: data.image
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
