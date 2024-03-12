const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const { uploadToS3Bucket } = require('../../../lib/awsS3')

module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
	try {
		if (req.method == 'POST') {
			const s3Folder = req.body.folder || req.body.s3Folder || ''
			console.log('req.file:', req.file)
			console.log('req.files:', req.files)
			console.log('req.body:', req.body)
			console.log('s3Folder:', s3Folder)

			if (!req.files || Object.keys(req.files).length === 0) {
				return reject('No files were uploaded.')
			}

			let i = 0
			let uploadFileList = []



			i = 0
			while (i < req.files.length) {
				const file = req.files[i]
				const zamanDamga = new Date().toISOString().split('.')[0].replace(/-|:|T/g, '')
				const fileName = file.originalname.toLowerCase().replace(/[^a-z0-9-.]/g, '-').replace(/((.jpeg)$|(.jpg)$|(.png)$)/, '')

				let fileList = []

				if (file.mimetype == 'image/png') {
					let fileList = await convertWebp(file, file.buffer)
					fileList.forEach(e => {
						e.originalname = `${fileName}_t${zamanDamga}_w${e.info.width}_h${e.info.height}.webp`
						e.fileName = `${s3Folder}/${e.originalname}`
						uploadFileList.push(e)
					})
				} else if (file.mimetype == 'image/jpeg') {
					let fileList = await convertAvif(file, file.buffer)
					fileList.forEach(e => {
						e.originalname = `${fileName}_t${zamanDamga}_w${e.info.width}_h${e.info.height}.avif`
						e.fileName = `${s3Folder}/${e.originalname}`

						uploadFileList.push(e)
					})
				} else {
					file.fileName = `${s3Folder}/${file.originalname}`
					uploadFileList.push(file)
				}
				i++
			}


			let result = []
			i = 0
			while (i < uploadFileList.length) {
				const item = uploadFileList[i]
				let obj = {
					// fieldname: 'file',
					originalname: item.originalname,
					// encoding: '7bit',
					mimetype: item.mimetype,
					size: item.size,

				}
				console.log('item.fileName:', item.fileName)
				obj.fileUrl = await uploadToS3Bucket(item.fileName, item.mimetype, item.buffer, item.size)
				if (item.mimetype.startsWith('image/') && item.info) {
					obj.width = item.info.width
					obj.height = item.info.height
				}
				result.push(obj)
				i++
			}

			console.log('result:', result)
			resolve(result)

		} else {
			restError.method(req, reject)
		}
	} catch (err) {
		console.log(err)
		reject(err || 'error')
	}
})



function convertWebp(file, buf) {
	return new Promise(async (resolve, reject) => {
		try {
			const mimetype = 'image/webp'
			let result = []
			const srp = sharp(buf).webp({ nearLossless: true, }).withExif({
				IFD0: { Copyright: process.env.IMAGE_SHARP_COPYRIGHT || 'AliAbi Open Source Digital Equipments' }
			})

			const buf1 = await srp.toBuffer({ resolveWithObject: true })

			result.push({
				info: buf1.info,
				buffer: buf1.data,
				mimetype: mimetype,
				size: buf1.info.size,
				width: buf1.info.width,
				height: buf1.info.height,
			})

			const buf2 = await srp.resize(512, 512, { fit: 'cover' }).toBuffer({ resolveWithObject: true })

			result.push({
				info: buf2.info,
				buffer: buf2.data,
				mimetype: mimetype,
				size: buf2.info.size,
				width: buf2.info.width,
				height: buf2.info.height,
			})

			const buf3 = await srp.resize(256, 256, { fit: 'cover' }).toBuffer({ resolveWithObject: true })

			result.push({
				info: buf3.info,
				buffer: buf3.data,
				mimetype: mimetype,
				size: buf3.info.size,
				width: buf3.info.width,
				height: buf3.info.height,
			})

			const buf4 = await srp.resize(64, 64, { fit: 'cover' }).toBuffer({ resolveWithObject: true })

			result.push({
				info: buf4.info,
				buffer: buf4.data,
				mimetype: mimetype,
				size: buf4.info.size,
				width: buf4.info.width,
				height: buf4.info.height,
			})



			resolve(result)
		} catch (err) {
			reject(err.message)
		}
	})

}

function convertAvif(file, buf) {
	return new Promise(async (resolve, reject) => {
		try {
			const mimetype = 'image/avif'
			let result = []
			const srp = sharp(buf).avif({}).withExif({
				IFD0: {
					Copyright: process.env.IMAGE_SHARP_COPYRIGHT || 'AliAbi Open Source Digital Equipments'
				}
			})

			const buf1 = await srp.toBuffer({ resolveWithObject: true })

			result.push({
				info: buf1.info,
				buffer: buf1.data,
				mimetype: mimetype,
				size: buf1.info.size,
				width: buf1.info.width,
				height: buf1.info.height,
			})

			const buf2 = await sharp(buf1.data).avif({}).resize(512, 512, { fit: 'cover' }).toBuffer({ resolveWithObject: true })
			// const buf2 = await srp.resize(512, 512, { fit: 'cover',kernel:'nearest' }).toBuffer({ resolveWithObject: true })

			result.push({
				info: buf2.info,
				buffer: buf2.data,
				mimetype: mimetype,
				size: buf2.info.size,
				width: buf2.info.width,
				height: buf2.info.height,
			})

			const buf3 = await sharp(buf2.data).avif({}).resize(256, 256, { fit: 'cover' }).toBuffer({ resolveWithObject: true })
			// const buf3 = await srp.resize(256, 256, { fit: 'cover',kernel:'nearest' }).toBuffer({ resolveWithObject: true })

			result.push({
				info: buf3.info,
				buffer: buf3.data,
				mimetype: mimetype,
				size: buf3.info.size,
				width: buf3.info.width,
				height: buf3.info.height,
			})

			const buf4 = await sharp(buf3.data).avif({}).resize(64, 64, { fit: 'cover' }).toBuffer({ resolveWithObject: true })
			// const buf4 = await srp.resize(64, 64, { fit: 'cover',kernel:'nearest' }).toBuffer({ resolveWithObject: true })

			result.push({
				info: buf4.info,
				buffer: buf4.data,
				mimetype: mimetype,
				size: buf3.info.size,
				width: buf3.info.width,
				height: buf3.info.height,
			})



			resolve(result)
		} catch (err) {
			reject(err.message)
		}
	})

}


// req.files: [
//   {
//     fieldname: 'file',
//     originalname: '14533467_172111819908353_6986170177058504704_n.jpg',
//     encoding: '7bit',
//     mimetype: 'image/jpeg',
//     destination: 'C:/tmp/',
//     filename: 'ea2db2cb84c9bd4d09523176358a5afd',
//     path: 'C:\\tmp\\ea2db2cb84c9bd4d09523176358a5afd',
//     size: 59658
//   }
// ]