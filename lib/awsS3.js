const { createPresignedPost } = require('@aws-sdk/s3-presigned-post')
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3')

// const testcmd=new ListBucketsCommand({ })
// client.send(testcmd)
// .then(result=>console.log(result))
// .catch(err=>console.log(err))

// const AWS=require('aws-sdk')
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region:process.env.AWS_REGION || 'default',
//   endpoint:process.env.S3_ENDPOINT,  
//   s3ForcePathStyle:true,
//   s3DisableBodySigning:true,
// })

// s3.listBuckets((err,data)=>{
//   if(!err){
//     console.log(data.Buckets)
//   }else{
//     console.log('hata s3 ',err)
//   }
// })




// exports.uploadToS3Bucket = (s3FilePath,mimetype,buffer) => new Promise(async (resolve, reject) => {
//   try {
//     if(s3FilePath.startsWith('/')) s3FilePath=s3FilePath.substring(1)
//     const params = {
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: s3FilePath,
//       Body: buffer,
//       ContentType: mimetype
//     }
//     await s3.upload(params).promise()
//     const fileUrl=process.env.AWS_S3_PUBLIC_URI + '/' + s3FilePath

//     resolve(fileUrl)
//   } catch (err) {
//     reject(err.message)
//   }
// })


exports.uploadToS3Bucket = (s3FilePath, mimetype, buffer,size) => new Promise(async (resolve, reject) => {
  try {
    const client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      region: process.env.AWS_REGION || 'default',
      endpoint: process.env.S3_ENDPOINT,
      disableHostPrefix: true,
      disableS3ExpressSessionAuth: true,
      forcePathStyle: true,
      
    })

    if (s3FilePath.startsWith('/')) s3FilePath = s3FilePath.substring(1)
    const uploadCmd=new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key:s3FilePath,
      Body:buffer,
      // ContentType:mimetype,
      // ContentLength:size,
      
    })

    const fileUrl=`${process.env.AWS_S3_PUBLIC_URI}/${s3FilePath}`
    await client.send(uploadCmd)
    resolve(fileUrl)
    // .then(result=>{
      
    //   // console.log('putobject result:', result)
    //   resolve(fileUrl)
    // })
    // .catch(err=>{
    //   console.log('putobject err:', err)
    //   reject(err)
    // })
  } catch (err) {
    console.log('tryErr:', err)
    reject(err)
  }
})

exports.s3Presign = (filename, contentType) => new Promise(async (resolve, reject) => {
  try {
    
    const { fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: filename,
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
      ],
      Fields: {},
      Expires: 3600,
    })
    const url = process.env.AWS_S3_PUBLIC_URI || ''
    resolve({ url: url, fields: fields })
  } catch (err) {
    reject(err.message)
  }
})


exports.uploadToS3Bucket111 = (s3FilePath, mimetype, buffer,size) => new Promise(async (resolve, reject) => {
  try {
    if (s3FilePath.startsWith('/')) s3FilePath = s3FilePath.substring(1)
    const { url, fields } = await exports.s3Presign(s3FilePath, mimetype)
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value)
    })
    formData.append('file', {
      buffer:buffer,
      mimetype:mimetype,
      size:size,

    })
    console.log('formData:', formData)
    const uploadResponse = await fetch(url, { method: 'POST', body: formData, })
    if (uploadResponse.ok) {
      const fileUrl = `${url}/${fields.key}`
      console.log('fileUrl:', fileUrl)
      resolve(fileUrl)
    } else {
      reject(uploadResponse.statusText)
    }
  } catch (err) {
    console.log(err)
    reject(err)
  }
})
