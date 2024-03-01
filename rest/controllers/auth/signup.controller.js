const sender = require('../../../lib/sender')

module.exports = (req) =>
	new Promise(async (resolve, reject) => {
		if (req.method == 'POST') {
			let data=req.body
			delete data._id
			
			if (!data.email) return reject('email required')
			if (!data.password ) return reject('password required')

			if(!data.address){
				data.address={
					region:data.address_region || '',
					cityName:data.address_cityName || '',
					citySubdivisionName:data.address_citySubdivisionName || '',
					district:data.address_district || '',
					streetName:data.address_streetName || '',
					buildingNumber:data.address_buildingNumber || '',
					buildingName:data.address_buildingName || '',
					blockName :data.address_blockName || '',
					room:data.address_room || '',
					postalZone:data.address_postalZone || '',
					country:{
						identificationCode:data.address_country_identificationCode || '',
						name:data.address_country_name || '',
					}
				}
			}
			db.users
				.findOne({ email: data.email })
				.then(async (userDoc) => {
					if (!userDoc) {
						await db.authCodes.deleteMany({ email: data.email, deviceId: data.deviceId, verified: false })
						data.name=(data.firstName || '') + ' ' + (data.lastName || '')
						const newAuthDoc = new db.authCodes({
							email: data.email,
							deviceId: data.deviceId,
							// authCode: '893050', //qwerty util.randomNumber(120000, 998000).toString(),
							authCode: util.randomNumber(120000, 998000).toString(),
							authCodeExpire: new Date(
								new Date().setSeconds(
									new Date().getSeconds() +
									Number(process.env.AUTHCODE_EXPIRE || 1800)
								)
							),
							verified: false,
							userInfo:data
						})
						newAuthDoc
							.save()
							.then((newAuthDoc2) => {
								sender
									.sendAuthEmail(newAuthDoc2.email, newAuthDoc2.authCode)
									.then(() => resolve(`email:${newAuthDoc2.email} authCode:${newAuthDoc2.authCode} /auth/verify icin kullanilacak.`))
									.catch(reject)
							})
							.catch(reject)
					} else {
						reject('user already exists')
					}
				})
				.catch(reject)
		} else {
			restError.method(req, reject)
		}
	})
