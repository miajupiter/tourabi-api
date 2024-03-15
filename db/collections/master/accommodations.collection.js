const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  let schema = mongoose.Schema(
    {
      title: { type: String, required: true, unique: true },
      propertyType: { type: String, required: true, default: 'hotel', enum: ['hotel', 'hostel', 'guesthouse', 'lodging', 'tent', 'caravan', 'camping', 'boat', 'housing', 'residence'] },
      destination: { type: String, default: '', index: true },
      description: { type: String, default: '' },
      stars: { type: Number, default: 2, index: true },
      capacity: { type: Number, default: 0 },
      country: { type: String, default: '', index: true },
      addressText: { type: String, default: '' },
      images: [{ type: mongoose.Schema.Types.ObjectId, ref: 's3images' }],
      distanceFrom: [{
        location: { type: String, default: '' },
        distance: { type: Number, default: 0 },
        duration: { type: Number, default: 0 },
      }],
      breakfast: {
        from: { type: String, default: '06:30' },
        to: { type: String, default: '09:00' },
      },
      checking: {
        checkIn: { type: String, default: '12:00' },
        checkOut: { type: String, default: '12:00' },
        rules: [{ type: String }]
      },
      services: [{ type: String }],
      propertyAmenities: [{ type: String }],
      roomTypes: [{ type: String, default: '' }],
      reviews: [{
        title: { type: String, default: '' },
        comment: { type: String, default: '' },
        commentBy: { type: String, default: '' },
        from: { type: String, default: '' },
        purpose: { type: String, default: 'holiday or leisure' },
        points: { type: Number, default: 1, min: 1, max: 5 },
        pointsDetail: {
          service: { type: Number, default: 1, min: 1, max: 5 },
          cleanliness: { type: Number, default: 1, min: 1, max: 5 },
          location: { type: Number, default: 1, min: 1, max: 5 },
          food: { type: Number, default: 1, min: 1, max: 5 },
          pricePerformance: { type: Number, default: 1, min: 1, max: 5 },
        },
        commentDate: { type: Date, default: Date.now },
      }],
      passive: { type: Boolean, default: false, index: true },
      createdDate: { type: Date, default: Date.now },
      createdBy: { type: String, default: '' },
      modifiedDate: { type: Date, default: Date.now, index: true },
      modifiedBy: { type: String, default: '', index: true },
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

  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  model.removeOne = (session, filter) => sendToTrash(dbModel, collectionName, session, filter)
  return model
}
