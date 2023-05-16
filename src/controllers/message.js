const Message = require('../models/Message')
const User = require('../models/User')
const Chat = require('../models/Chat')


const sendMessage = async(req,res,next) => {   
      try{

        if(!req.body.message || !req.body.chatId ){
            throw new Error('invalid credentials')
        }
         const messageData = new Message({
             sender:req.user?._id,
             message:req.body?.message,
             chat:req.body?.chatId,
         })

          let message = await Message.create(messageData)

          const chat = await Chat.findOne({_id:req.body.chatId})
          if(!chat){
              return next(new Error('no chat availabale'))
          }
          chat.latestMessage = message?._id,
          chat.currentSender = req?.user?._id

          await chat.save()

         message = await message.populate("sender", "_id firstname lastname username photo")
         message = await message.populate("chat")
          
          message = await User.populate(message,{
              path:'chat.users',
              select:'_id firstname lastname username photo'
          })
                  
          message = await Message.populate(message, {
              path:"chat.latestMessage",
          })


          const reformedMessage = [message]?.map((message)=>{
             if(new Date(`${message.createdAt}`).getFullYear() === new Date(Date.now()).getFullYear()){ 
                return ({...message._doc, createdAt: new Date(`${message.createdAt}`).toLocaleDateString('en', {weekday:"short",month:"short",day:"numeric"})})
             }else{
                 return ({...message._doc, createdAt: new Date(`${message.createdAt}`).toLocaleDateString('en', {weekday:"short",year:"numeric",month:"short",day:"numeric"})})
             }

        })

          res.status(200).json(reformedMessage[0])

      }catch(error){
          next(error)
      }

}


const allMessages = async(req,res,next)=> {
     if(!req.params.id){
         return next(new Error('missing id'))
     }

     let page;
     if(req.query.page){
         page = page
     }
     else{
         page = 1
     }

    try{

        //const total posts
       const total = await Message.countDocuments({chat:req?.params?.id})
       const limit = 40;
       let skip
       
       const totalPage = Math.ceil(total/limit)

       if(total < limit){
           skip = 0
       }else{
           skip = (totalPage-(page + 1)) * limit
       }
        




        const messages = await Message.find({chat:req?.params?.id})
        .populate("sender", "_id firstname lastname username photo").skip(skip)

        const reformedMessage = messages?.map((message)=>{
             if(new Date(`${message.createdAt}`).getFullYear() === new Date(Date.now()).getFullYear()){ 
                 return {...message._doc, createdAt: new Date(`${message.createdAt}`)
                .toLocaleDateString('en', {weekday:"short",month:"short", day:"numeric"})}

             }else{
                 return {...message._doc, createdAt: new Date(`${message.createdAt}`)
                 .toLocaleDateString('en', {weekday:"short", year:"numeric",month:"short", day:"numeric"})}
             }
        })

        res.status(200).json(reformedMessage)    
    }catch(error){
        next(error)  
    }
}

module.exports = {sendMessage,allMessages}

