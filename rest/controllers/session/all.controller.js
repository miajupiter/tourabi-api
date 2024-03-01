module.exports = (dbModel, sessionDoc, req) =>
	new Promise(async (resolve, reject) => {
		if (req.method === 'GET') {
			db.sessions.find({ userId: sessionDoc.userId })
				.populate({
					path: 'userId',
					select: '-password'
				})
				.then(resolve)
				.catch(reject)
		} else {
			restError.method(req, reject)
		}
	})
