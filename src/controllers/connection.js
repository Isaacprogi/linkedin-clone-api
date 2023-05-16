const User = require('../models/User')
const Connections = require('../models/Connections')

const followAndUnfollowUser = async (req, res, next) => {
    if (!req.params.id) {
        return next({ message: "you cant follow this user" })
    }
    const followerSender = await User.findById({ _id: req.user._id })
    const followReciever = await User.findById({ _id: req.params.id })

        
        if(!followerSender || !followReciever){
            return next(new Error('connection cannot be sent at the moment'))
        }

        if(JSON.stringify(followerSender._id) === JSON.stringify(followReciever._id)){
            return next(new Error("you can't follwer your self"))
        }

    try {
        const checkA = await User.findById({ _id: req.user._id })
        const checkB = await User.findById({ _id: req.params.id })


        if (!checkA?.following.includes(req.params.id) && !checkB?.followers.includes(req.user._id)) {
            const follower = await User.findByIdAndUpdate({ _id: req.user._id },
                { $push: { following: req.params.id } }, { new: true })
                .populate('followers','_id firstname lastname username title photo').populate('following', '_id firstname lastname username title photo')
            const following = await User.findByIdAndUpdate({ _id: req.params.id },
                { $push: { followers: req.user._id } }, { new: true })
                .populate('followers','_id firstname lastname username title photo').populate('following', '_id firstname lastname username title photo')
            return res.status(200).json({ follower, following })
        }

        const follower = await User.findByIdAndUpdate({ _id: req.user._id },
            { $pull: { following: req.params.id } }, { new: true })
            .populate('followers','_id firstname lastname username title photo').populate('following', '_id firstname lastname username title photo')
        const following = await User.findByIdAndUpdate({ _id: req.params.id },
            { $pull: { followers: req.user._id } }, { new: true })
            .populate('followers','_id firstname lastname username title photo').populate('following', '_id firstname lastname username title photo')
        res.status(200).json({ follower, following })

    } catch (error) {
        next(error)
    }

}




const createConnection = async (req, res, next) => {

    if (!req.params.id) {
        return next({ message: "you can't follow this user" })
    }
    try {
        const connectionSender = await User.findById({ _id: req.user._id })
        const connectionReciever = await User.findById({ _id: req.params.id })

        
        if(!connectionSender || !connectionReciever){
            return next(new Error('connection cannot be sent at the moment'))
        }

        if(JSON.stringify(connectionSender._id) === JSON.stringify(connectionReciever._id)){
            return next(new Error("you can't send connection to your self"))
        }


        const checkConnection = await Connections.find({
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: req.params.id } } }
            ]
        })
        let newConnection;

        if (checkConnection?.length > 0) {
             return next(new Error("connection exists already and cannot be sent at the moment"))
        } else{


           if(!connectionSender?.connections?.includes(req.params.id) && !connectionReciever?.connections?.includes(req.user._id)){
            if(!connectionSender.pendingSentConnections.includes(req.params.id) && !connectionReciever.pendingIncommingConnections.includes(req.user._id)){

                 
                newConnection = await Connections({
                    sender:req.user._id,
                    users:[req.user._id, req.params.id]
                })
                await newConnection.save()

                newConnection = await newConnection.populate('users','_id firstname lastname username email photo')

                connectionSender.pendingSentConnections.push(req.params.id)
                connectionReciever.pendingIncommingConnections.push(req.user._id)
    
                await connectionSender.save()
                await connectionReciever.save()
    
                
            }
            return res.status(200).json([ connectionSender, connectionReciever, newConnection ])
           }

        }    
    } catch (error) {
        next(error)
    }
}




const acceptConnection = async (req, res, next) => {
    if (!req.params.id) {
        return next({ message: "you cant connect with unknown" })
    }
    try {
        const connectionReciever = await User.findById({ _id: req.user._id })
        const connectionSender = await User.findById({ _id: req.params.id })

        if(!connectionSender || !connectionReciever){
            return next(new Error("unknown users"))
        }

        if(JSON.stringify(connectionReciever._id) === JSON.stringify(connectionSender._id)){
            return next(new Error("you can't accept your own connection"))
        }


        const checkConnection  =  await Connections.findOne({
            sender:req.params.id,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: req.params.id } } }
            ],
            pending:true
        }).populate('users','_id firstname lastname username photo title')

        if(checkConnection) {
                
            if(!connectionReciever.connections.includes(req.params.id) &&
             !connectionSender.connections.includes(req.user._id)){

                if(connectionReciever?.pendingIncommingConnections?.includes(req.params.id) &&
                 connectionSender?.pendingSentConnections?.includes(req.user._id)){
                    
                    checkConnection.pending = false
                    await checkConnection.save()

                    connectionReciever.pendingIncommingConnections.pull(req.params.id)
                    connectionReciever.connections.push(req.params.id)
                    connectionSender.pendingSentConnections.pull(req.user._id)
                    connectionSender.connections.push(req.user._id)
                     

                   await connectionReciever.save()
                   await connectionSender.save()
                   
                   return res.status(200).json([connectionSender,connectionReciever,checkConnection])
                }
                return next(new Error('incoplete validation'))
            }
            return next(new Error('incomplete validation'))
            
        }else{
            return next(new Error("connection accepted, you can't accept your connection or connection dosent exist"))
        }
    } catch (error) {
        next(error)
    }

}



const rejectConnection = async (req, res, next) => {
    if (!req.params.id) {
        return next({ message: "you cant reject an unknown connection" })
    }
    try {
        const connectionReciever = await User.findById({ _id: req.user._id })
        const connectionSender = await User.findById({ _id: req.params.id })

        if(!connectionSender || !connectionReciever){
            return next(new Error("unknown user or users"))
        }

        if(JSON.stringify(connectionReciever._id) === JSON.stringify(connectionSender._id)){
            return next(new Error("you can't accept your own connection"))
        }


        const checkConnection  =  await Connections.findOne({
            sender:req.params.id,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: req.params.id } } }
            ],
            pending:true
        })

        if(checkConnection) {

            if(!connectionReciever?.connections.includes(req.params.id) && !connectionSender.connections.includes(req.user?._id)){

                if(connectionReciever?.pendingIncommingConnections?.includes(req.params?.id) && connectionSender?.pendingSentConnections?.includes(req.user?._id)){
                   
                   const deletedConnection = await Connections.findOneAndDelete({
                     sender:req.params.id,
                     $and: [
                         { users: { $elemMatch: { $eq: req.user?._id } } },
                         { users: { $elemMatch: { $eq: req.params.id } } }
                     ],
                     pending:true
                 })

                    connectionReciever.pendingIncommingConnections.pull(req.params.id)
                    connectionSender.pendingSentConnections.pull(req.user?._id)
                   
                   await connectionReciever.save()
                   await connectionSender.save()

                 return res.status(200).json([connectionSender,connectionReciever,deletedConnection])
                }
                return next(new Error('nothing is wrong'))
            }
            
            return next(new Error('nothing is wrong'))
        }else{
            return next(new Error("connection rejected, you can't reject your own connection or connection dosent exist"))
        }
    } catch (error) {
        next(error)
    }
}




const cancelSentConnection = async (req, res, next) => {
    if (!req.params.id) {
        return next({ message: "you cant cancel an unknown connection" })
    }
    try {
        const connectionReciever = await User.findById({ _id: req.params.id  })
        const connectionSender = await User.findById({ _id: req.user?._id })

        if(!connectionSender || !connectionReciever){
            return next(new Error("unknown user or users"))
        }

        if(JSON.stringify(connectionReciever._id) === JSON.stringify(connectionSender._id)){
            return next(new Error("you can't cancel your own connection"))
        }


        const checkConnection  =  await Connections.find({
            sender:req.user._id,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: req.params.id } } }
            ],
            pending:true
        })

        if(checkConnection.length > 0) {

            if(!connectionReciever?.connections.includes(req.user._id) && !connectionSender?.connections.includes(req.params.id)){

                if(connectionReciever?.pendingIncommingConnections?.includes(req.user._id) && connectionSender?.pendingSentConnections?.includes(req.params.id)){


                   const connection  = await Connections.findOneAndDelete({
                     sender:req.user?._id,
                     $and: [
                         { users: { $elemMatch: { $eq: req.user._id } } },
                         { users: { $elemMatch: { $eq: req.params.id } } }
                     ],
                     pending:true
                    }).populate('users','_id firstname lastname username email photo')

                    connectionReciever.pendingIncommingConnections.pull(req.user._id)
                    connectionSender.pendingSentConnections.pull(req.params.id)
                   
               
                   await connectionReciever.save()
                   await connectionSender.save()

                 return res.status(200).json([connectionSender,connectionReciever,connection])
                }
                return next(new Error('incomplete process'))
            }
            
            return next(new Error('imcomplete process'))
        }else{
            return next(new Error("inapproprite rejection"))
        }
    } catch (error) {
        next(error)
    }
}


const removeConnection = async (req, res, next) => {
    if (!req.params.id) {
        return next({ message: "you cant remove an unknown connection" })
    }
    try {
        const connectionReciever = await User.findById({ _id: req.params.id  })
        const connectionSender = await User.findById({ _id: req.user?._id })

        if(!connectionSender || !connectionReciever){
            return next(new Error("unknown user or users"))
        }

        if(JSON.stringify(connectionReciever._id) === JSON.stringify(connectionSender._id)){
            return next(new Error("you connection to reject"))
        }


        const checkConnection  =  await Connections.find({
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: req.params.id } } }
            ],
            pending:false
        })
        
        if(checkConnection?.length > 0) {

            if(connectionReciever?.connections?.includes(req.user._id) && connectionSender?.connections?.includes(req.params.id)){

                if(!connectionReciever?.pendingIncommingConnections?.includes(req.user?._id) && !connectionSender?.pendingSentConnections?.includes(req.params.id)){
                   
                    await Connections.deleteOne({
                     $and: [
                         { users: { $elemMatch: { $eq: req.user._id } } },
                         { users: { $elemMatch: { $eq: req.params.id } } }
                     ],
                     pending:false
                 })

                    connectionReciever?.connections?.pull(req.user?._id)
                    connectionSender?.connections?.pull(req.params.id)
                   
               
                   await connectionReciever.save()
                   await connectionSender.save()

                   return res.status(200).json([connectionSender,connectionReciever])
                }
                return next(new Error('missing pending connections'))
            }
              return next(new Error('connection is not present'))
        }else{
            return next(new Error("no connection to remove"))
        }
    } catch (error) {
        next(error)
    }
}


const getPendingConnections = async(req,res,next) => {
       try{
        const connection  =  await Connections.find({
            sender:{$ne:req.user._id},
            users: { $elemMatch: { $eq: req.user._id } } ,
            pending:true
        }).populate('sender','_id firstname lastname username photo title')
        
        res.status(200).json(connection)
       }catch(error){
           next(error)
       }
}

const getPendingSentConnections = async(req,res,next) => {
       try{
        const connection  =  await Connections.find({
            sender:req.user._id,
            users: { $elemMatch: { $eq: req.user._id } } ,
            pending:true
        }).populate('users','_id firstname lastname username photo title')
        
        res.status(200).json(connection)
       }catch(error){
           next(error)
       }
}




const getConnections = async (req,res,next) => {
    
    try{
        let connections  =  await Connections.find({
            users: { $elemMatch: { $eq: req.user._id } } ,
            pending:false
        }).populate({
            path:'users',
            select:'_id firstname lastname username photo title'
        })

        if(req.query.search){
            const reg = new RegExp("^"+req.query.search,'i')   
            connections  =  await Connections.find({
                users: { $elemMatch: { $eq: req.user._id } } ,
                pending:false
            }).populate({
                path:'users',
                match:{
                    $or:[
                        { firstname: {$regex:reg}},
                        { lastname: {$regex:reg}}
                     ]
                },
                select:'_id firstname lastname username photo title'
            })
        }
        res.status(200).json(connections)

    }catch(error){
        next(error)
    }
}


module.exports = {
    followAndUnfollowUser,
    createConnection,
    acceptConnection,
    rejectConnection,
    getPendingConnections,
    getPendingSentConnections,
    getConnections,
    cancelSentConnection,
    removeConnection,
}