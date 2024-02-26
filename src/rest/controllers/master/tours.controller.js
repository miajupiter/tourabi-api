module.exports = (dbModel, sessionDoc, req) => new Promise(async (resolve, reject) => {
  switch (req.method) {
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

    // const totalDocs=await dbModel.tours.countDocuments({passive:false})
    // const pageCount=totalDocs/options.limit
    // options.page=util.randomNumber(1,pageCount)
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
        // docs.forEach(doc=>{
        //   console.log(`doc.resim`,doc.resim)
        //   // doc.images=doc.images.slice(0,1)
        //   // if(doc.images.length>0){
        //   //   doc.image=doc.images[0]
        //   // }
        //   // delete doc.images
        // })

        resolve(docs)
      })
      .catch(reject)

    // dbModel.tours.paginate(filter, options)
    //   .then(result => {
    //     result.docs.forEach(doc => {
    //       doc.image = (doc.images || []).slice(0, 1)
    //     })
    //     resolve(result)
    //   }).catch(reject)

    // dbModel.tours.find(filter)
    //   .select('_id title duration places priceWithoutDiscount price currency images')
    //   .limit( req.query.pageSize || 4)
    //   .sort({ showcase: 1, createdDate: -1 })
    //   .then(docs => {
    //     docs.forEach(doc => {
    //       doc.images = (doc.images || []).slice(0, 1)
    //     })
    //     resolve(docs)
    //   }).catch(reject)
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
    let options = {
      page: req.query.page || 1,
      limit: req.query.pageSize || 10,
      select: '_id title duration places images currency passive',

    }

    let filter = {
      passive: false
    }

    dbModel.tours.paginate(filter, options)
      .then(result => {
        result.docs.forEach(doc => {
          doc.images = (doc.images || []).slice(0, 3)
        })
        resolve(result)
      }).catch(reject)
  })
}
