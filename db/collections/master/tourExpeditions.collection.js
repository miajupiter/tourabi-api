const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
	let schema = mongoose.Schema(
		{
			tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'tours', required:true, index: true },
			expeditionNumber: { type: String, default: '', index: true },
			duration: { type: Number, default: 0, index: true },
			dateFrom: { type: String, default: new Date().toISOString().substring(0, 10) },
			dateTo: { type: String, default: new Date().toISOString().substring(0, 10) },
			deadline: { type: String, default: new Date().toISOString().substring(0, 10) },
			status: { type: String, default: 'pending', enum: ['pending', 'avail', 'closed', 'cancelled'] },
			price: { type: Number, default: 0, min: 0, index:true },
			currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'AZN', 'RUB', 'TRY', 'GBP'] },
			priceWithoutDiscount: { type: Number, default: 0, min: 0 },
			singleSupplement: {
				normal: { type: Number, default: 0 },
				economy: { type: Number, default: 0 },
				comfort: { type: Number, default: 0 }
			},
			pricePerPerson: [{
				personCount: { type: Number, default: 0 },
				normal: { type: Number, default: 0 },
				economy: { type: Number, default: 0 },
				comfort: { type: Number, default: 0 },
			}],
			quantitySold: { type: Number, default: 0, },

			createdDate: { type: Date, default: Date.now },
			createdBy:{type:String,default:''},
			modifiedDate: { type: Date, default: Date.now, index: true },
			modifiedBy:{type:String,default:'',index:true}

		},
		{ versionKey: false }
	)

	schema.pre('save', (next) => {
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
