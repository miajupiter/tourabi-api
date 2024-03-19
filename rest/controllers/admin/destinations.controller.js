module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
  if (!sessionDoc) return restError.auth(req, reject)
  switch (req.method) {
    case 'SEARCH':
      getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
    break
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

function getOne(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.destinations
      .findOne({ _id: req.params.param1 })
      .populate('images')
      .then(doc => {

        console.log('admin/destinations getOne doc:',doc)
        if (dbNull(doc, reject)) {
          resolve(doc)
        }
      })
      .catch(reject)
  })
}


function getList(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    const search=getSearchParams(req,{},{
      select: '_id title country images passive',
      populate:'images'
    })

    dbModel.destinations.paginate(search.filter, search.options)
      .then(result => {
        result.docs.forEach(doc => {
          if(doc.images){
            doc.images = (doc.images || []).slice(0, 3)
          }
        })
        resolve(result)
      }).catch(reject)
  })
}

function post(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    let data = req.body || {}
    data._id = undefined
    let newDoc = new dbModel.destinations(data)

    if (!epValidateSync(newDoc, reject)) return
    newDoc.save().then(resolve).catch(reject)
  })
}

function put(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (req.params.param1 == undefined) return restError.param1(req, reject)
    let data = req.body || {}
    delete data._id
    
    dbModel.destinations
      .findOne({ _id: req.params.param1 })
      .then((doc) => {
        if (dbNull(doc, reject)) {
          let newDoc = Object.assign(doc, data)
          if (!epValidateSync(newDoc, (err) => {
            reject(err)
          })) return
          console.log('newDoc.passive:', newDoc.passive)
          newDoc.save().then(resp => {
            if ((req.query.partial || '').toString() === 'true') {
              resolve(data)
            } else {
              resolve(resp)
            }
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

    dbModel.destinations.removeOne(sessionDoc, { _id: req.params.param1 }).then(resolve).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
