module.exports = (req) =>
	new Promise((resolve, reject) => {
		if(req.method =='GET' || req.method=='POST'){
				let username =req.params.param1 || req.body.username || req.query.username || ''
				if (username.trim() == '') return reject('username required')
				if (!username.includes('@') && !username.startsWith('+') && !isNaN(username)){
					username = `+${username}`
				}
		
				checkUsername(username).then(resolve).catch(reject)
			
		}else restError.method(req, reject)
		
	})

function checkUsername(username) {
	return new Promise((resolve, reject) => {
		db.members
			.findOne({ username: username })
			.then((doc) => {
				if (doc == null) {
					reject(`User not found`)
				} else if (doc.passive) {
					reject(`User is not active`)
				} else {
					resolve()
				}
			})
			.catch(reject)
	})
}
