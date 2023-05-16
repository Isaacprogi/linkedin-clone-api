const mongoose  = require('mongoose')



const postModel = mongoose.Schema({
       post:{type:String,  unique:false,required:false},
       file:{type:String,  unique:false,required:false},
       fileHeight:{type:String, unique:false,required:false},
       fileWidth:{type:String, unique:false,required:false},
       user:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
       likes:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
       reposts:[{type:mongoose.Schema.Types.ObjectId, ref:'User',unique:false}],
       comments:[{type:mongoose.Schema.Types.ObjectId, ref:'Comment'}],
       type:{type:String, required:false}
},{
    timestamps:true,
}
)


module.exports = Post = mongoose.model("Post", postModel);
