const { permissionSchemaType } = require('../../helpers/db-types')
const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  let schema = mongoose.Schema(
    {
      userId: { type: ObjectId, ref: 'users', index: true },
      title: { type: String, default: '' },
      body: { type: String, default: '' },
      image: { type: String, default: '' },
      read: { type: Boolean, default: false, index: true },
      createdDate: { type: Date, default: Date.now },
    },
    { versionKey: false },
    // { capped: true, size: 5242880, max: 5000 }
  )


  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  model.removeOne = (session, filter) =>
    sendToTrash(dbModel, collectionName, session, filter)
  return model
}
