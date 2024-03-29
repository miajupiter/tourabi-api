module.exports = (dbModel, sessionDoc, req) => new Promise((resolve, reject) => {

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
		dbModel.users.findOne({ _id: sessionDoc.userId }).then(doc => {

			if (dbNull(doc, reject)) {
				let obj = doc.toJSON()
				obj.id=doc._id
				resolve(obj)
			}
		}).catch(reject)
	})
}


function updateMyProfile(dbModel, sessionDoc, req) {
	
	return new Promise((resolve, reject) => {
		dbModel.users.findOne({ _id: sessionDoc.userId }).then(doc => {
			if (dbNull(doc, reject)) {
				let data = req.body || {}
				delete data._id
				
				let newDoc =Object.assign(doc, data)
				if (!epValidateSync(newDoc, reject)) return
				newDoc.save().then(resp => {
					if ((req.query.partial || '').toString() === 'true') {
						resolve(data)
					} else {
						resolve(resp)
					}
				}).catch(err => {
					console.log(err)
					reject(err)
				})
			}
		})
			.catch(reject)
	})
}
