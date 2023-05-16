const User = require('../models/User')
const {cloudinary} = require('../config/cloudinaryConfig')

const getUsers = async (req, res) => {
    try {
        let users = await User.find({_id:{$ne:req?.user?._id}}).select('_id firstname lastname title username photo following followers')
        if (!users) {
            return res.json({
                success: false,
                error: 'No user available'
            })
        }
        
        
        if(req.query.search){
             const reg = new RegExp("^"+req.query.search,'i')   
             users = await User.find({
                _id:{$ne:req.user?._id},
                 $or:[
                { firstname: {$regex:reg}},
                { lastname: {$regex:reg}}
             ]})
         }

        if(req?.query?.random){
            const getRandomElements =()=> {
                      return [...users]?.sort(()=> Math.random() > 0.5 ? 1 : -1)?.slice(0,req?.query?.random)
                
          }
        
          return res.status(200).json({
            success: true,
            users:getRandomElements()
        })
        } 

        res.status(200).json({
            success: true,
            users
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message

        })
    }


}

const getRandomUsers = async (req, res) => {
    try {
        
        let users = await User.find({
            _id:{$ne:req?.user?._id},
            followers: {$ne:req.user?._id},      
        }).limit(50).select('_id firstname lastname title username photo following followers')
        if (!users) {
            return res.json({
                success: false,
                error: 'No user available'
            })
        }
        
        if(req?.query?.random){
            const getRandomElements =()=> {
                      return [...users]?.sort(()=> Math.random() > 0.5 ? 1 : -1)?.slice(0,req?.query?.random)
                
          }
          res.status(200).json({
            success: true,
            users:getRandomElements()
        })
        }

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message

        })
    }


}


const getUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findOne({ _id: id }).select('-password')
        populate('followers','_id firstname lastname username title photo').populate('following', '_id firstname lastname username title photo')
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'user does not exist'
            })
        }

        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }


}



const getAllUserInfo = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findOne({_id:id}).
        populate('followers','_id, firstname lastname username title photo').populate('following', '_id, firstname lastname username title photo')
        
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'user does not exist'
            })
        }
        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }

}

const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({username:username}).
        populate('followers','_id, firstname lastname username title photo').populate('following', '_id, firstname lastname username title photo')
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'user does not exist'
            })
        }
        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }

}


const peopleFromYourCountry = async(req,res,next) =>{
       if(!req.query.country){
           return next(new Error('nothing to query'))
       }

    try{
        const reg = new RegExp(req.query.country,'i') 
        const users = await User.find({
           _id:{$ne:req.user?._id},
           country: {$regex:reg}
        }).select('_id firstname lastname username title photo')
        if(!users){
            return next(new Error('no user found'))
        }
        res.status(200).json(users)
    }catch(error){
        next(error)
    }

}





const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: id }).select('-password')
        if (!user) {
            res.status(400).json({
                success: false,
                error: 'user does not exist'
            })
        }
        await user.deleteOne({ _id: id })
        res.status(200).json({
            success: true,
            message: 'Account deleted succesfully'
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const { firstname, lastname, email, state, street, country, phoneNumber } = req.body

    // check all fields
    if (!firstname || !lastname || !email || !state || !street || !country || !phoneNumber) {
        return res.status(401).json({ error: 'fill in all fields please' })
    }
    //validate fields with joi validation
    const { error } = userUpdateValidation({ firstname, lastname, email, state, country, phoneNumber })
    if (error) {
        return errorValidateResponse(res, error)
    }
    try {
        const updatedUser = await User.updateOne({ _id: id },
            {
                $set: { firstname, lastname, email, state, street, country, phoneNumber }
            })
        res.status(200).json({
            success: true,
            user: updatedUser
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }

}



const profilePicUpload = async (req, res, next) => {
       const file = req.file.path
        try{
            const uploadedResponse = await cloudinary.uploader.upload(file,
                {uploadpreset:'linkedn_uploads'}
                )
            return res.status(200).json(uploadedResponse)   
        }catch(error){
            return next(error)
        }  
}




module.exports = {
    getUsers,
    getUser,
    getAllUserInfo,
    deleteUser,
    updateUser,
    peopleFromYourCountry,
    getUserProfile,
    getRandomUsers,
    profilePicUpload,
}