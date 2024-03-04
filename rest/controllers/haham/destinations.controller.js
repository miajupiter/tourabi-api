

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
    dbModel.destinations
      .findOne({ _id: req.params.param1, passive: false })
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
    const search=getSearchParams(req,{passive:false})

    dbModel.destinations.paginate(search.filter, search.options)
    .then(result => {
      result.docs.forEach(doc => {
        if(doc.images){
          doc.images = (doc.images || []).slice(0, 1)
        }
      })
      resolve(result)
    })
    .catch(reject)
  })
}