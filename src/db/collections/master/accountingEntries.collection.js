const { permissionSchemaType } = require('../../helpers/db-types')
const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
  let schema = mongoose.Schema(
    {
      userId: { type: ObjectId, ref: 'users', index: true },
      entryDate: { type: Date, default: Date.now },
      entryDescription:{ type: String, default:'' },
      entryLines:[{
        accountCode: { type: String, default:''},
        accountName: { type: String, default:''},
        lineType:{type:String,default:'payment'},
        lineDescription:{type:String,default:''},
        debit: { type: Number, default:0 },
        credit: { type: Number, default:0 },
      }],
      totalDebit: { type: Number, default:0 },
      totalCredit: { type: Number, default:0 },
      currency:{type:String, default:'USD', index:true},
      status:{type:String, default:'pending', enum:['pending','approved','declined','error']},
      reviewMessage:{ type: String, default:'' },
      reviewedBy: { type: ObjectId, ref: 'users', index: true},
      reviewedDate: { type: Date, default: Date.now },
      createdDate: { type: Date, default: Date.now, index: true },
      modifiedDate: { type: Date, default: Date.now }
    },
    { versionKey: false },
    // { capped : true, size : 5242880, max :
    //   5000 } 
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
