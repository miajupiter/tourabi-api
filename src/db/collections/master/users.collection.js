const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  let schema = mongoose.Schema(
    {
      name: { type: String, default: '', index: true },
      username: { type: String, default: '', index: true },
      email: { type: String, required: true, unique: true },
      role: { type: String, default: 'user', enum: ['user', 'manager', 'admin', 'sysadmin'] },
      gender: { type: String, default: '', enum: ['', 'female', 'male', 'other'] },
      image: { type: String, default: '' },
      dateOfBirth: { type: String, default: '2000-01-01', index:true },
      phoneNumber: { type: String, default: '', index:true },
      address: {
				room: { type: String, default: '' },
				streetName: { type: String, default: '' },
				blockName: { type: String, default: '' },
				buildingName: { type: String, default: '' },
				buildingNumber: { type: String, default: '' },
				citySubdivisionName: { type: String, default: '' },
				cityName: { type: String, default: '' },
				postalZone: { type: String, default: '' },
				postbox: { type: String, default: '' },
				region: { type: String, default: '' },
				district: { type: String, default: '' },
				country: {
					identificationCode: { type: String, default: '' },
					name: { type: String, default: '' }
				},
			},
      bio: { type: String, default: '' },
      passive: { type: Boolean, default: false, index: true },
      emailVerified: { type: Date, default: Date.now },
      createdDate: { type: Date, default: Date.now },
      modifiedDate: { type: Date, default: Date.now }
    },
    { versionKey: false }
  )

  schema.pre('save', (next) => next())
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  model.removeOne = (member, filter) =>
    sendToTrash(dbModel, collectionName, member, filter)
  return model
}
