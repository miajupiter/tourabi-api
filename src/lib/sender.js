const { sendSms } = require('./sender-sms')
const { sendEmail } = require('./sender-email')

exports.sendAuthSms = (tel, authCode) =>
	new Promise((resolve, reject) => {
		let msg = process.env.SMS_VERIFY_TEMPLATE || '${authCode} verification code'
		msg = eval('`' + msg + '`')

		sendSms(tel, msg)
			.then(resolve).catch(reject)
	})



exports.sendAuthEmail = (email, authCode) =>
	new Promise((resolve, reject) => {
		let msg = process.env.EMAIL_VERIFY_TEMPLATE || '${authCode} verification code.'
		let subject = process.env.EMAIL_VERIFY_SUBJECT || 'Verification Code'
		msg = eval('`' + msg + '`')
		subject = eval('`' + subject + '`')

		sendEmail(email, subject, msg)
			.then(resolve).catch(reject)
	})

exports.sendForgotPasswordSms = (tel, password) =>
	new Promise((resolve, reject) => {
		let msg = process.env.SMS_FORGOT_TEMPLATE || 'Your password: ${password} . Don\'t forget to change your password asap.'
		msg = eval('`' + msg + '`')

		sendSms(tel, msg)
			.then(resolve).catch(reject)
	})

exports.sendForgotPasswordEmail = (email, password) =>
	new Promise((resolve, reject) => {
		let msg = process.env.EMAIL_FORGOT_TEMPLATE || 'Your password: ${password}<br>. Don\'t forget to change your password asap.'
		let subject = process.env.EMAIL_FORGOT_SUBJECT || 'Your Password'
		msg = eval('`' + msg + '`')
		subject = eval('`' + subject + '`')

		sendEmail(email, subject, msg)
			.then(resolve).catch(reject)
	})
