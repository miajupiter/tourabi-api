const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
	let schema = mongoose.Schema(
		{
			owner: { type: mongoose.Schema.Types.ObjectId, ref: 'members', default: null, index: true },
			title: { type: String, required: true, unique: true },
			destination: { type: String, default: '', index: true },
			description: { type: String, default: '' },
			duration: { type: Number, default: 0, index: true },
			places: { type: String, default: '' },
			inclusions: { type: String, default: '' },
			exclusions: { type: String, default: '' },
			currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'AZN', 'RUB', 'TRY', 'GBP'] },
			priceWithoutDiscount: { type: Number, default: 0, min: 0 },
			price: { type: Number, default: 0, min: 0, index: true },
			singleSupplement: { type: Number, default: 0 },
			publishStart: { type: Date, default: Date.now, index: true },
			publishEnd: { type: Date, default: Date.now, index: true },
			groupSize: {
				min: { type: Number, default: 0 },
				max: { type: Number, default: 0 }
			},
			images: [{
				title: { type: String, default: '' },
				src: { type: String, default: '' },
				width: { type: Number, default: 800 },
				height: { type: Number, default: 800 },
				style: { type: String, default: '' },
				alt: { type: String, default: '' },
				thumbnail: { type: String, default: '' },
			}],
			priceTable: [{
				dateFrom: { type: Date, default: null },
				dateTo: { type: Date, default: null },
				deadline: { type: Date, default: null },
				status: { type: String, default: '', enum: ['', 'avail', 'closed', 'cancelled'] },
				price: { type: Number, default: 0, min: 0 },
			}],
			travelPlan: [{
				step: { type: Number, default: 0 },
				title: { type: String, default: '' },
				description: { type: String, default: '' },
			}],
			showcase: { type: Boolean, default: false, index: true },
			passive: { type: Boolean, default: false, index: true },
			createdDate: { type: Date, default: Date.now },
			modifiedDate: { type: Date, default: Date.now, index: true },
			i18n: {
				type: Object,
				default: {
					lastTranslated: { type: Date, default: Date.UTC(0, 0, 0), index: true },
					en: { title: String, description: String },
					tr: { title: String, description: String },
					ru: { title: String, description: String },
					de: { title: String, description: String },
					es: { title: String, description: String },
					ko: { title: String, description: String },
					fr: { title: String, description: String },
					zh: { title: String, description: String },
				},
				select: false
			},
			temp: {}
		},
		{ versionKey: false }
	)

	schema.pre('save', (next) => {
		if (this.price > this.priceWithoutDiscount) {
			this.priceWithoutDiscount = this.price
		}
		next()
	})
	schema.pre('remove', (next) => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', (model) => { })
	schema.plugin(mongoosePaginate)

	let model = dbModel.conn.model(collectionName, schema, collectionName)

	model.removeOne = (session, filter) => sendToTrash(dbModel, collectionName, session, filter)
	return model
}
