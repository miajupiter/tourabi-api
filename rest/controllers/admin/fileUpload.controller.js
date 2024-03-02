module.exports = (dbModel, sessionDoc, req) => new Promise((resolve, reject) => {
	if (req.method == 'POST') {
	
		if (!req.files || Object.keys(req.files).length === 0) {
			return reject('No files were uploaded.')
		}

		console.log('req.files:',req.files)
		resolve()
		// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
		// let sampleFile = req.files.sampleFile
		// let uploadPath

		// uploadPath = __dirname + '/somewhere/on/your/server/' + sampleFile.name

		// // Use the mv() method to place the file somewhere on your server
		// sampleFile.mv(uploadPath, function (err) {
		// 	if (err)
		// 		return res.status(500).send(err)

		// 	res.send('File uploaded!')
		// })
	}else{
		restError.method(req, reject)
	}
})

