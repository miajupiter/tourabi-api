const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  let schema = mongoose.Schema(
    {
      name: { type: String, default:'',index:true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true, index: true },
      role: { type: String, default: 'user', enum: ['user', 'manager', 'admin', 'sysadmin'] },
      firstName: { type: String, default:'',  required11: true },
      lastName: { type: String,default:'',  required11: true },
      gender: { type: String, default: '', enum: ['', 'female', 'male', 'other'] },
      image: { type: String, default: '' },
      dateOfBirth: { type: String, default: '2000-01-01', index:true },
      phoneNumber: { type: String, default:'',  required11: true, index:true },
      address: {
				room: { type: String, default: '' },
				streetName: { type: String,  required11: true },
				blockName: { type: String, default: '' },
				buildingName: { type: String, default: '' },
				buildingNumber: { type: String, default: '' },
				citySubdivisionName: { type: String, default: '' },
				cityName: { type: String,  required11: true},
				postalZone: { type: String,  required11: true },
				region: { type: String, default: '' },
				district: { type: String, default: '' },
				country: {
					identificationCode: { type: String,  required11: true },
					name: { type: String, default: '' }
				},
			},
      companyLegalName: { type: String, default:'', required11:true },
      taxOffice: { type: String, default:'', required11:true },
      taxNumber: { type: String, default:'', required11:true },
      companyLogo: { type: String, default: '' },
      paymentInfo:{
        bankAccountName: { type: String, default: '' },
        ibanNo: { type: String, default: '' },
        creditCard:{
          holderName:{ type: String, default: '' },
          cardNo:{ type: String, default: '' },
          validYear: { type: String, default: '' },
          validMonth: { type: String, default: '' },
          ccv: { type: String, default: '' },
        },
        ethereumWallet: { type: String, default: '' },
        bitcoinWallet: { type: String, default: '' },
      },
      passive: { type: Boolean, default: false, index: true },
      verify:{
        authCode:{ type: String, default: '' },
        emailVerified:{ type: Boolean, default: false },
        phoneVerified:{ type: Boolean, default: false }
      },
      bio: { type: String, default: '' },
      emailVerified: { type: Date, default: null},
      createdDate: { type: Date, default: Date.now },
      modifiedDate: { type: Date, default: Date.now }
    },
    { versionKey: false }
  )

  schema.pre('save', (next) => { 
    this.name=(this.firstName || '') + ' ' + (this.lastName || '') 
    next()
  })
  schema.pre('remove', (next) => next())
  schema.pre('remove', true, (next, done) => next())
  schema.on('init', (model) => { })
  schema.plugin(mongoosePaginate)

  let model = dbModel.conn.model(collectionName, schema, collectionName)

  model.removeOne = (member, filter) =>
    sendToTrash(dbModel, collectionName, member, filter)
  return model
}
