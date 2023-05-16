const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MediaSchema = new Schema({
    name: {
        type:String,
        required:true,
    },
    videos: [{type:String}]
},
  {
    timestamps: true
  }
)

const Media = mongoose.model('Media', MediaSchema)

module.exports = Media