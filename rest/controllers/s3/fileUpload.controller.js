const sharp = require('sharp')
const { uploadToS3Bucket } = require('../../../lib/awsS3')
const { ObjectId } = require('mongodb')
const imageWithExif = {
	IFD0: { Copyright: process.env.IMAGE_SHARP_COPYRIGHT || 'AliAbi Open Source Digital Equipments' }
}


module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
	try {
		if (req.method != 'POST') return restError.method(req, reject)

		if (!req.files || Object.keys(req.files).length === 0) {
			return reject('No files were uploaded.')
		}
		reject('modul is not ready yet')
		

	} catch (err) {
		devLog(err)
		reject(err || 'error')
	}
})
