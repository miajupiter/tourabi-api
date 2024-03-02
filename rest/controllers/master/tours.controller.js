module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
  switch (req.method) {
    case 'SEARCH':
      getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
    break
    case 'GET':
      if (req.params.param1 != undefined) {
        if (req.params.param1 == 'showcase') {
          showcase(dbModel, sessionDoc, req).then(resolve).catch(reject)
        } else {
          getOne(dbModel, sessionDoc, req).then(resolve).catch(reject)
        }
      } else {
        getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
      }
      break

    default:
      restError.method(req, reject)
      break
  }
})

function showcase(dbModel, sessionDoc, req) {
  return new Promise(async (resolve, reject) => {

    let options = {
      page: req.query.page || 1,
      limit: req.query.pageSize || 5,
      select: '_id title duration places priceWithoutDiscount price currency images',
    }

    let filter = {
      passive: false
    }

    dbModel.tours.aggregate([
      { $sample: { size: 5 } },
      {
        $project: {
          _id: 1, title: 1, duration: 1, places: 1, priceWithoutDiscount: 1, price: 1, currency: 1,
          image:{"$first":"$images"}
        }
      }
    ])
      .then(docs => {
          resolve(docs)
      })
      .catch(reject)

  })
}

function getOne(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.tours
      .findOne({ _id: req.params.param1 })
      .then(doc => {
        if (dbNull(doc, reject)) {
          // var obj = doc.toJSON()
          // obj.id = doc._id.toString()
          resolve(doc)
        }
      })
      .catch(reject)
  })
}

function getList(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    // const search=getSearchParams(req,{passive:false},{
    //   select: '_id title  duration places images currency price priceWithourDiscount passive'
    // })
    const search=getSearchParams(req,{passive:false})
    console.log('tours search.filter:',search.filter)
    dbModel.tours.paginate(search.filter, search.options)
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
