const sharp = require('sharp')
const { uploadToS3Bucket } = require('../../../lib/awsS3')
const imageWithExif = {
	IFD0: { Copyright: process.env.IMAGE_SHARP_COPYRIGHT || 'AliAbi Open Source Digital Equipments' }
}


module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
	try {
		if (req.method != 'POST') return restError.method(req, reject)

		const s3Folder = req.body.folder || req.body.s3Folder || ''
		const imgResizeFit = req.body.fit || req.body.fit || 'outside'
		devLog('req.file:', req.file)
		devLog('req.files:', req.files)
		devLog('req.body:', req.body)
		devLog('s3Folder:', s3Folder)

		if (!req.files || Object.keys(req.files).length === 0) {
			return reject('No files were uploaded.')
		}
		var result = []
		var backgroundTasks = []
		let i = 0
		///let uploadFileList = []




		while (i < req.files.length) {
			const file = req.files[i]
			const zamanDamga = new Date().toISOString().split('.')[0].replace(/-|:|T/g, '')
			const fileName = file.originalname.toLowerCase().replace(/[^a-z0-9-.]/g, '-').replace(/((.jpeg)$|(.jpg)$|(.png)$)/, '')



			if (file.mimetype.startsWith('image/')) {
				/** bekleme yapma, bir yandan orjinali yedekleyelim */
				const fileNameOrg = `original-images/${s3Folder}/${fileName}_t${zamanDamga}` + (file.mimetype == 'image/png' ? '.png' : '.jpg')
				uploadToS3Bucket(fileNameOrg, file.mimetype, file.buffer, file.size)
					.then(resp => {
						devLog('original image yedek resp: ', resp)
					}).catch(err => {
						devError('original image yedek err: ', err)
					})
				/** end */

				let imgData = await convertMainImage(file.mimetype, file.buffer)

				let s3UploadFileBasePath = `${s3Folder}/${fileName}_t${zamanDamga}`
				let extension = file.mimetype == 'image/png' ? '.webp' : '.avif'
				let mimetype = file.mimetype == 'image/png' ? 'image/webp' : 'image/avif'

				let s3UploadFilePath = `${s3UploadFileBasePath}_w${imgData.info.width}_h${imgData.info.height}${extension}`
				let fileUrl = await uploadToS3Bucket(s3UploadFilePath, mimetype, imgData.data, imgData.info.size)
				let obj = {
					mimetype: mimetype,
					originalname: file.originalname,
					size: imgData.info.size,
					width: imgData.info.width,
					height: imgData.info.height,
					fileUrl: fileUrl,
					w100FileUrl: `${process.env.AWS_S3_PUBLIC_URI}/${s3UploadFileBasePath}_w100${extension}`,
					w200FileUrl: `${process.env.AWS_S3_PUBLIC_URI}/${s3UploadFileBasePath}_w200${extension}`,
					w400FileUrl: `${process.env.AWS_S3_PUBLIC_URI}/${s3UploadFileBasePath}_w400${extension}`,
					w800FileUrl: `${process.env.AWS_S3_PUBLIC_URI}/${s3UploadFileBasePath}_w800${extension}`,
					// w1200FileUrl: `${process.env.AWS_S3_PUBLIC_URI}/${s3UploadFileBasePath}_w1200${extension}`,
				}
				result.push(obj)

				devLog('continueBackground i:', i, ' file:', file.originalname)
				continueBackground({
					file: file,
					mainImgData: imgData,
					extension: extension,
					mimetype: mimetype,
					s3UploadFileBasePath: s3UploadFileBasePath,
					imgResizeFit: imgResizeFit,
				})
					.then(resp => {
						devLog('continueBackground i:', i, ' file:', file.originalname, `\nresp:`, resp)
					})
					.catch(err => {
						devError('continueBackground i:', i, ' file:', file.originalname, `\nerr:`, err)
					})

			} else {
				let obj = {
					mimetype: file.mimetype,
					originalname: file.originalname,
					size: file.size,
					fileUrl: await uploadToS3Bucket(`${s3Folder}/${fileName}`, file.mimetype, file.buffer, file.size)
				}
				result.push(obj)
			}

			i++
		}


		devLog('result:', result)
		resolve(result)

		/** start converting other image sizes on background */
		// continueBackground(imgData)


	} catch (err) {
		devLog(err)
		reject(err || 'error')
	}
})

function continueBackground(task) {
	/** task
	{
		file: file,
		mainImgData: imgData,
		extension: extension,
		mimetype: mimetype,
		s3UploadFileBasePath: s3UploadFileBasePath,
		imgResizeFit:imgResizeFit,
	}
 */
	return new Promise(async (resolve, reject) => {
		try {
			const file = task.file
			const mainImgData = task.mainImgData
			const s3UploadFileBasePath = task.s3UploadFileBasePath
			const mimetype = task.mimetype
			const extension = task.extension
			const imgResizeFit = task.imgResizeFit

			/** Image 800  buffer from mainImgData */
			const img800 = await convertSmallImages(file.mimetype, mainImgData.data, imgResizeFit, 800, 800)
			devLog('img800 created:', img800.info)
			const w800FileUrl = await uploadToS3Bucket(`${s3UploadFileBasePath}_w800${extension}`, mimetype, img800.data, img800.info.size)
			devLog('w800FileUrl uploaded:', w800FileUrl)


			/** Image 400  buffer from .... */
			const img400 = await convertSmallImages(file.mimetype, img800.data, imgResizeFit, 400, 400)
			devLog('img400 created:', img400.info)
			const w400FileUrl = await uploadToS3Bucket(`${s3UploadFileBasePath}_w400${extension}`, mimetype, img400.data, img400.info.size)
			devLog('w400FileUrl uploaded:', w400FileUrl)

			/** Image 200  buffer from .... */
			const img200 = await convertSmallImages(file.mimetype, img400.data, imgResizeFit, 200, 200)
			devLog('img200 created:', img200.info)
			const w200FileUrl = await uploadToS3Bucket(`${s3UploadFileBasePath}_w200${extension}`, mimetype, img200.data, img200.info.size)
			devLog('w200FileUrl uploaded:', w200FileUrl)

			/** Image 100  buffer from .... */
			const img100 = await convertSmallImages(file.mimetype, img200.data, imgResizeFit, 100, 100)
			devLog('img100 created:', img100.info)
			const w100FileUrl = await uploadToS3Bucket(`${s3UploadFileBasePath}_w100${extension}`, mimetype, img100.data, img100.info.size)
			devLog('w100FileUrl uploaded:', w100FileUrl)

			resolve(`${file.originalname} completed`)
		} catch (err) {
			devError(`err:`, err)
			reject(err.message || err || 'error')
		}
	})
}

function convertSmallImages(mimetype, buf, fit = 'contain', width = null, height = null) {
	return new Promise(async (resolve, reject) => {
		let srp = null
		let result = null
		if (mimetype == 'image/png') {
			srp = sharp(buf).webp({ nearLossless: true, }).withExifMerge(imageWithExif)
			result = await srp.withMetadata().resize(width, height, { fit: fit }).toBuffer({ resolveWithObject: true })
			result.info.mimetype = 'image/webp'
		} else {
			srp = sharp(buf).avif({ lossless: true }).withExifMerge(imageWithExif)
			result = await srp.withMetadata().resize(width, height, { fit: fit }).toBuffer({ resolveWithObject: true })
			result.info.mimetype = 'image/avif'
		}
		resolve(result)
	})
}


function convertMainImage(mimetype, buf) {
	return new Promise(async (resolve, reject) => {
		let srp = null
		let result = null
		if (mimetype == 'image/png') {
			srp = sharp(buf).withMetadata().webp({ nearLossless: true, }).withExifMerge(imageWithExif)
			result = await srp.toBuffer({ resolveWithObject: true })
			// result = await srp.composite([{
			// 	input: path.join(__dirname, 'watermark-w150.png'),
			// }]).toBuffer({ resolveWithObject: true })
		} else {
			// srp = sharp(buf).withMetadata().avif({}).withExifMerge(imageWithExif)
			srp = sharp(buf).avif({}).withExifMerge(imageWithExif)
			result = await srp.rotate().toBuffer({ resolveWithObject: true })
			// result = await srp.composite([{
			// 	input: path.join(__dirname, 'watermark-w300.png'),
			// }]).toBuffer({ resolveWithObject: true })
		}
		resolve(result)
	})
}
