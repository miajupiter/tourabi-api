

module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
  if (!sessionDoc && ['POST', 'PUT', 'DELETE'].includes(req.method))
    return restError.auth(req, reject)
  switch (req.method) {
    case 'GET':
      if (req.params.param1 != undefined) {
        getOne(dbModel, sessionDoc, req).then(resolve).catch(reject)
      } else {
        getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
      }
      break

    default:
      restError.method(req, reject)
      break
  }
})

function getOne(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.destinations
      .findOne({ _id: req.params.param1, passive:false })
      .then(doc => {
        if (dbNull(doc, reject)) {
          resolve(doc)
        }
      })
      .catch(reject)
  })
}


function getList(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    let options = {
      page: req.query.page || 1,
      limit: req.query.pageSize || 10,
      select: '_id title country images passive',
    }

    let filter = {
      passive:false,
      'images.0':{$exists:true}
    }

    dbModel.destinations.paginate(filter, options)
      .then(result => {
        result.docs.forEach(doc => {
          doc.images = (doc.images || []).slice(0, 1)
        })
        resolve(result)
      }).catch(reject)
  })
}