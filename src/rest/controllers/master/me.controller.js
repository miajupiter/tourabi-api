module.exports = (dbModel, sessionDoc, req) => new Promise((resolve, reject) => {
	if(!sessionDoc)
		return restError.auth(req,reject)

	switch (req.method) {
		case 'GET':
			getMyProfile(dbModel, sessionDoc, req).then(resolve).catch(reject)
			break
		case 'PUT':
			updateMyProfile(dbModel, sessionDoc, req).then(resolve).catch(reject)
			break
		default:
			restError.method(req, reject)
			break
	}
})


function getMyProfile(dbModel, sessionDoc, req) {
	return new Promise((resolve, reject) => {
		db.users.findOne({ _id: sessionDoc.userId }).then(doc => {

			if (dbNull(doc, reject)) {
				let obj = doc.toJSON()

				resolve(obj)
			}
		}).catch(reject)
	})
}


function updateMyProfile(dbModel, sessionDoc, req) {
	console.log('req.body:', req.body)
	return new Promise((resolve, reject) => {
		db.users.findOne({ _id: sessionDoc.userId }).then(doc => {
			if (dbNull(doc, reject)) {
				let data = req.body || {}
				delete data._id
				console.log('data:', data)
				let newDoc =Object.assign(doc, data)
				if (!epValidateSync(newDoc, reject)) return
				newDoc.save().then(resp => {
					// console.log('resp:', resp)
					resolve(resp)
				}).catch(err => {
					console.log(err)
					reject(err)
				})
			}
		})
			.catch(reject)
	})
}
