const Chat = require('../models/Chat')
const User = require('../models/User')
const mongoose = require('mongoose')

const enterChat = async (req, res, next) => {
    if (!req.body.userId) return res.sendStatus(400)
    try {
        let currentChat = await Chat.find({
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: req.body.userId } } }
            ]
        }).populate("users", "_id firstname lastname username photo").populate("latestMessage")

      current = await User.populate(currentChat, {
        path:"latestMessage.sender",
        select:"_id firstname lastname username photo",
      })

        if (currentChat?.length === 0) {
            try {
                const chatData = new Chat({
                    users: [req.user._id, req.body.userId]
                })
                const newChat = await Chat.create(chatData)
                const FullChat = await Chat.findById(newChat._id).populate('users', '_id firstname lastname username photo').populate('latestMessage')
                return res.status(200).json([FullChat])
            } catch (error) {
                next(error)
            }
        }
        res.status(200).json(currentChat)

    } catch (error) {
        next(error)
    }
}


const allChats = async(req,res,next) =>{
    try{
        let chats = await Chat.find(
            {users:{$elemMatch: {$eq:req.user._id}},           
        })
        .populate({
            path:'users',
            select:'_id firstname lastname username photo title',
        }) .populate('latestMessage')
           .sort({updatedAt:-1})
           chats = await User.populate(chats,{
               path:"latestMessage.sender",
               select:"_id firstname lastname username photo"
           })
       
           //do the search and update chat
        if(req.query.search){
           const reg = new RegExp("^"+req.query.search,'i')  
         chats = await Chat.find(
            {users:{$elemMatch: {$eq:req.user._id}},           
        })
        .populate({
            path:'users',
            select:'_id firstname lastname username photo title',
            match:{
                $or:[
                    { firstname: {$regex:reg}},
                    { lastname: {$regex:reg}}
                 ]
                },
        }) .populate('latestMessage')
           .sort({updatedAt:-1})
           chats = await User.populate(chats,{
               path:"latestMessage.sender",
               select:"_id firstname lastname username photo"
           })
        } 
        return res.status(200).send(chats)
    }            
    catch(error){
        next(error)
    }
}


const deleteChat = async(req,res,next) => {
     if(!req.params.id){
         res.sendStatus(400)
         throw new Error('id required')
     }
    try{
        const check = await Chat.findById({_id:req.params.id})
        if(!check){
           return next(new Error('dosent exist'))
        }
        await Chat.findByIdAndDelete({_id:req.params.id})
        res.sendStatus(200)
    }catch(error){
        next(error)
    }
}


const readChat = async(req,res,next) => {
     if(!req.params.id){
         next(new Error('id is required'))
     }
    try{
        const check = await Chat.findOne({_id:req.params.id}).populate('users','_id firstname lastname username title photo').
        populate({
            path:'latestMessage',
            populate: {
                path:'sender',
                select:'_id firstname lastname username photo title'
            }
        })
        if(!check){
            next(new Error('dosent exist or read'))
        }

        check.currentSender = ''
        await check.save()
        res.status(200).json(check)
    }catch(error){
        next(error)
    }
}



module.exports = { enterChat, allChats, deleteChat, readChat }