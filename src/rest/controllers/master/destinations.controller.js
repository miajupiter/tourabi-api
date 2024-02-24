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
      .findOne({ _id: req.params.param1 })
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

      // populate: [
      //   {
      //     path: 'destinations',
      //     select: '_id name',
      //   },
      // ],
    }

    // if (req.query.pageSize || req.query.limit)
    //   options.limit = req.query.pageSize || req.query.limit

    let filter = {
      passive:false
    }


    dbModel.destinations.paginate(filter, options)
      .then(result => {
        resolve(result)
      }).catch(reject)
  })
}
