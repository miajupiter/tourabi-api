const axios = require('axios')

exports.sendSms=function (dest, msg) {
  return new Promise(async (resolve, reject) => {
    if(!process.env.SMS_API_URI)
      return resolve()

    const data = {
      username: process.env.SMS_USERNAME,
      password: process.env.SMS_PASSWORD,
      messages: [{ dest: dest, msg: msg }]
    }

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: process.env.SMS_API_URI,
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data)
    }

    axios.request(config)
      .then(resp=>{
        resolve(resp.data)
      })
      .catch(err=>{
        let errMsg=err.response && (err.response.data || err.response.statusText) || err.message || 'sms error'
        reject(errMsg)
      })
  })
}