const collectionName = path.basename(__filename, '.collection.js')
const mongoose = require('mongoose')
module.exports = function (dbModel) {
  let  schema = mongoose.Schema(
    {
      title: { type: String, index: true },
      description: { type: String, default: '' },
      reviews: [
        {
          title: { type: String, default: '' },
          comment: { type: String, default: '' }
        }
      ],
      test1: { type: String, default: '' },
      test2: { type: String, default: '' },
      createdDate: { type: Date, default: Date.now, select: false },
      modifiedDate: { type: Date, default: Date.now, select: false }
    },
    { versionKey: false }
  )

  schema.pre('find', function () {
    console.log(this instanceof mongoose.Query) 
    this.test2 = this.title
  })
  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)
  const model = dbModel.conn.model(collectionName, schema, collectionName)

  model.removeOne = (session, filter) =>
    sendToTrash(dbModel, collectionName, session, filter)
  return model
}
