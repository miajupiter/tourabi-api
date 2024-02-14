module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
  if(!sessionDoc && ['POST','PUT','DELETE'].includes(req.method))
    return restError.auth(req,reject)
  switch (req.method) {
    case 'GET':
      if (req.params.param1 != undefined) {
        getOne(dbModel, sessionDoc, req).then(resolve).catch(reject)
      } else {
        getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
      }
      break
    case 'POST':
      post(dbModel, sessionDoc, req).then(resolve).catch(reject)

      break
    case 'PUT':
      put(dbModel, sessionDoc, req).then(resolve).catch(reject)
      break
    case 'DELETE':
      deleteItem(dbModel, sessionDoc, req).then(resolve).catch(reject)
      break
    default:
      restError.method(req, reject)
      break
  }
})

const imageBaseUrl = 'https://miajupiter.com/media/tour-img01/'

function getOne(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.tours
      .findOne({ _id: req.params.param1 })
      .then(doc => {
        var obj = doc.toJSON()
        obj.id = doc._id.toString()
        obj.featuredImage = ''
        obj.price = 0
        obj.images = []
        if (doc.images.length > 0) {
          obj.featuredImage = {
            src: imageBaseUrl + doc.images[0].image || '',
            width: 900,
            height: 900,
          }

          doc.images.forEach(e => {
            obj.images.push({
              src: imageBaseUrl + e.image,
              width: 900,
              height: 900,
            })
          })
        }
        if (doc.priceTable && doc.priceTable.length > 0) {
          //qwerty  tarih kontrolu ekle, en yakinlarda en dusukten belki
          obj.price = doc.priceTable[0].price
        }

        obj.desc = (obj.description || '').substring(0, 140) + '...'
        resolve(obj)
      })
      .catch(reject)
  })
}

function getList(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    let options = {
      page: req.query.page || 1,
      limit: req.query.pageSize || 10,
      select: '_id title description duration places images priceTable currency',

      // populate: [
      //   {
      //     path: 'tours',
      //     select: '_id name',
      //   },
      // ],
    }

    // if (req.query.pageSize || req.query.limit)
    //   options.limit = req.query.pageSize || req.query.limit

    let filter = {}
    if ((req.query.my || '').toString() == 'true') {
      filter.owner = sessionDoc.userId
    }
    if ((req.query.passive || '') != '') {
      filter.passive = req.query.passive
    }

    dbModel.tours.paginate(filter, options).then(result => {
      var list = []
      result.docs.forEach(doc => {
        var obj = Object.assign({}, doc)
        obj.id = doc._id.toString()
        obj.featuredImage = ''
        obj.price = 0
        obj.images = []
        if (doc.images.length > 0) {
          obj.featuredImage = {
            src: imageBaseUrl + doc.images[0].image || '',
            width: 500,
            height: 500,
          }
          const list3 = doc.images.slice(0, 3)
          list3.forEach(e => {
            obj.images.push({
              // src: imageBaseUrl + e.image,
              src: imageBaseUrl + e.thumbnail,
              width: 500,
              height: 500,
            })
          })
        }
        if (doc.priceTable && doc.priceTable.length > 0) {
          //qwerty  tarih kontrolu ekle, en yakinlarda en dusukten belki
          obj.price = doc.priceTable[0].price
        }

        obj.desc = (obj.description || '').substring(0, 140) + '...'
        list.push(obj)
      })

      result.docs = list

      // if (result.docs.length > 0) {
      //   console.log(result.docs[0])
      // }

      resolve(result)
    }).catch(reject)
  })
}

function post(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    let data = req.body || {}
    data._id = undefined
    data.owner = sessionDoc.userId
    let newDoc = new dbModel.tours(data)

    if (!epValidateSync(newDoc, reject)) return
    newDoc.save().then(resolve).catch(reject)
  })
}

function put(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (req.params.param1 == undefined) return restError.param1(req, reject)
    let data = req.body || {}
    delete data._id

    dbModel.tours
      .findOne({ _id: req.params.param1, owner: sessionDoc.userId })
      .then((doc) => {
        if (dbNull(doc, reject)) {
          let newDoc = Object.assign(doc, data)
          if (!epValidateSync(newDoc, (err) => {
            reject(err)
          })) return
          newDoc.save().then(resp => {
            console.log('resp:', resp)
            resolve(resp)
          }).catch(err => {
            console.log(err)
            reject(err)
          })
        }
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}

function deleteItem(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (req.params.param1 == undefined) return restError.param1(req, next)
    let data = req.body || {}
    data._id = req.params.param1

    dbModel.tours.removeOne(sessionDoc, { _id: data._id, owner: sessionDoc.userId }).then(resolve).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
