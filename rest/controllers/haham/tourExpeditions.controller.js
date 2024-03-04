module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
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
    default:
      restError.method(req, reject)
      break
  }
})

function getOne(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.tourExpeditions
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
    const search = getSearchParams(req, {
      status:'avail',
      deadline:{$gte:new Date().toISOString().substring(0,10)}
    }, { })
    console.log('search.filter:', search.filter)
    console.log('search.options:', search.options)

    dbModel.tourExpeditions.paginate(search.filter, search.options)
      .then(result => {
        console.log('tourExpeditions result:', result)
        resolve(result)
      }).catch(reject)
  })
}
