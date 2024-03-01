const collectionName = path.basename(__filename, '.collection.js')
const langSchemaType={
  translatedAt:{type:Date,default: Date.now, index: true },
  doc:{}
}
module.exports = function (dbModel) {
  let schema = mongoose.Schema(
    {
      collectionName: { type: String, required:true, index:true },
      documentId: {type: mongoose.Schema.Types.ObjectId, index: true },
      ar: langSchemaType,
      az: langSchemaType,
      de: langSchemaType,
      en: langSchemaType,
      es: langSchemaType,
      fa: langSchemaType,
      fr: langSchemaType,
      it: langSchemaType,
      jp: langSchemaType,
      ko: langSchemaType,  // Korean
      nl: langSchemaType,
      pl: langSchemaType,
      pt: langSchemaType,
      ro: langSchemaType,
      ru: langSchemaType,
      tr: langSchemaType,
      zh: langSchemaType,
      lang_id: langSchemaType, // Indonesian
      he: langSchemaType, // Hebrew
      ms: langSchemaType, // Malay
    },
    { versionKey: false }
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
