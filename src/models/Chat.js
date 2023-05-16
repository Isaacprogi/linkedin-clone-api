const mongoose  = require('mongoose')


const chatModel = mongoose.Schema({
       users: [{
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
       }],
       latestMessage: {
          type:mongoose.Schema.Types.ObjectId,
          ref:"Message",
       },
       currentSender: {
        type:String,
    },
},{
    timestamps:true,
}
)

const Chat = mongoose.model("Chat", chatModel);

module.exports  = Chat
