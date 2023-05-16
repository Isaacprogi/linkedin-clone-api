const mongoose  = require('mongoose')


const repostModel = mongoose.Schema({
       user: {
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
       },
       post: {
          type:mongoose.Schema.Types.ObjectId,
          ref:"Post",
       }
},{
    timestamps:true,
}
)

const Repost = mongoose.model("Repost", repostModel);

module.exports  = Repost
