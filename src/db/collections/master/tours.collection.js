const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
	let schema = mongoose.Schema(
		{
			owner: { type: mongoose.Schema.Types.ObjectId, ref: 'members',default:null, index: true },
			title: { type: String, required: true, unique: true },
			description: { type: String, default: '' },
			duration: { type: Number, default: 0, index: true },
			places: { type: String, default: '' },
			inclusions: { type: String, default: '' },
			exclusions: { type: String, default: '' },
			currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'AZN', 'RUB', 'TRY', 'GBP'] },
			singleSupplement: { type: Number, default: 0 },
			publishStart: { type: Date, default: Date.now, index: true },
			publishEnd: { type: Date, default: Date.now, index: true },
			images: [{
				image: { type: String, default: '' },
				thumbnail: { type: String, default: '' },
			}],
			priceTable: [{
				dateFrom: { type: Date, default: null },
				dateTo: { type: Date, default: null },
				deadline: { type: Date, default: null },
				status: { type: String, default: '', enum: ['', 'avail', 'closed', 'cancelled'] },
				price: { type: Number, default: 0 },
			}],
			travelPlan: [{
				step: { type: Number, default: 0 },
				title: { type: String, default: '' },
				description: { type: String, default: '' },
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
