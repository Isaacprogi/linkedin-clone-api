const mongoose  = require('mongoose')


const CommentModel = mongoose.Schema({
       post: {
           type:mongoose.Schema.Types.ObjectId,
           ref:"Post",unique:false
       },
       comment:{type:String, required:true, unique:false},
       user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",unique:false
    },
       
},{
    timestamps:true,
}
)

const Comment = mongoose.model("Comment", CommentModel);

module.exports  = Comment
