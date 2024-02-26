const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
	let schema = mongoose.Schema(
		{
			title: { type: String, required: true, unique: true },
			description: { type: String, default: '' },
			country: { type: String, default: '',index:true },
			images: [{
        title: { type: String, default: '' },
        src: { type: String, default: '' },
        width: { type: Number, default: 800 },
        height: { type: Number, default: 800 },
        style: { type: String, default: '' },
        alt: { type: String, default: '' },
        thumbnail: { type: String, default: '' },
      }],
			passive: { type: Boolean, default: false, index: true },
			createdDate: { type: Date, default: Date.now },
			modifiedDate: { type: Date, default: Date.now, index: true },
		},
		{ versionKey: false }
	)

	schema.pre('save', (next) => next())
	schema.pre('remove', (next) => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', (model) => { })
	schema.plugin(mongoosePaginate)

	let model = dbModel.conn.model(collectionName, schema, collectionName)

	model.removeOne = (session, filter) => sendToTrash(dbModel, collectionName, session, filter)
	return model
}
