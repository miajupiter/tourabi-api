const { createPresignedPost } = require('@aws-sdk/s3-presigned-post')
const { S3Client } =require('@aws-sdk/client-s3')


exports.s3Presign = (filename, contentType) => new Promise((resolve, reject) => {
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    region: process.env.AWS_REGION,
  })

  createPresignedPost(client, {
    Bucket: process.env.AWS_S3_BUCKET || '',
    Key: filename,
    Conditions: [
      ['content-length-range', 0, 10485760], // up to 10 MB
      // ['starts-with', '$Content-Type', contentType],
    ],
    Fields: {
      // acl: 'public-read',
      // 'Content-Type': contentType,
    },
    Expires: 600, // Seconds before the presigned post expires. 3600 by default.
  })
    .then(resolve)
    .catch(reject)

})


exports.uploadToS3Bucket = (file, s3FilePath) =>
  new Promise((resolve, reject) => {
    if (!file) {
      return reject('Please select a file to upload.')
    }
    exports.s3Presign(s3FilePath, file.type)
      .then(response => {
        if (response.ok) {
          response
            .json()
            .then(result => {
              const { url, fields } = result
              const formData = new FormData()
              Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value)
              })
              formData.append('file', file)
              console.log('formData:', formData)
              fetch(url, { method: 'POST', body: formData, })
                .then(uploadResponse => {
                  if (uploadResponse.ok) {
                    const fileUrl = `${url}${fields.key}`
                    console.log('fileUrl:', fileUrl)
                    resolve(fileUrl)
                  } else {
                    reject('upload failed')
                  }
                })
                .catch(reject)
            })
            .catch(reject)

        } else {
          reject('Failed to get pre-signed URL.')
        }
      })
      .catch(reject)
  })
