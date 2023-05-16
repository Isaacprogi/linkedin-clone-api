const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { registerValidation, loginValidation, errorValidateResponse, registerCompleteValidation} = require('../utils/validation')
const {createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken} = require('../utils/token')



//register user
const register = async (req,res) => {
    const { username, email, password, confirmPassword,photo} = req.body
    const {confirmPassword:CP,...others} = req.body

     
    // check all fields
        if (!email || !password || !username || !confirmPassword || !photo) {
        return res.status(400).json({ error: `All fields are required 
         (${!photo? 'photo':''}${!email?', email':""}${!username?', username':""}${!confirmPassword?', confrimPassword':""}${!password?', password':""})`})
    }
 
    
     
    if(password !== confirmPassword) {
        return res.status(400).json({error:"password don't match"})
    }

    //validate fields with joi validation
    const { error } = registerValidation(req.body)
    if(error){
       return errorValidateResponse(res,error)
    }
            
    try {

        // check if the user exists with either the email or username 
        //since they ssre both unique
        const existUsername = await User.findOne({username}).select('password') 
        if (existUsername) return res.status(400).json({ error:'username is taken'})

        const existEmail = await User.findOne({email}).select('password') 
        if (existEmail) return res.status(400).json({ error:'email is taken'})


        // create a new user and send a resonse
        const user = new User(others)
        await user.save() 
         //password is hased in the user model before it us saved
        // send back a successful message and request they log in
        res.status(200).json({
            successs: true,
            message:"successful"
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}


const CompleteRegistration = async (req,res) => {
    const {email, firstname, lastname, title, country} = req.body

       // check all fields
       if (!firstname || !lastname || !title || !country) {
        return res.status(400).json({ error: `All fields are required 
         (${!firstname? 'firstname':''}${!lastname?', lastname':""}${!title?', title':""}${!country?', country':""})`})
    }

       if(!email){
           return res.status(400).json({noData:true, error:'please login to complete profile setup'})
       }
      
    
    
    //validate fields with joi validation
    const { error } = registerCompleteValidation({firstname,lastname,title,country})
    if(error){
       return errorValidateResponse(res,error)
       
    }


    try {

        const user = await User.find({email:email})
        if(user?.length < 1){
            return res.status(400).json({noData:true, error:'your pr'})
        }
        
         
       

        // create a new user and send a resonse
        await User.updateMany({email:email},{firstname,lastname,title,country})

        res.status(200).json({
            successs: true,
            message:"successful"
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}


//login user
const login = async (req, res,next) => {
    const { email, password } = req.body
    //check all fields 
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "All fields are required"
        })
    }
    
    //validate fields
    const { error } = loginValidation({email})
    if(error){
        return errorValidateResponse(res,error)

     }

     try {
         //check if user exist
         const user = await User.findOne({ email: email })
         .populate('followers','_id, firstname lastname username title photo').populate('following', '_id, firstname lastname username title photo')
        

         if (!user) return res.status(400).json({
             success: false,
             error: "Invalid Credentials"
            })


            if(!user?.firstname  || !user?.lastname  || !user?.title  || !user?.country ){
                return res.status(400).json({complete:false})
            }
                     
            //compare password
            const match = await user.isMatch(req.body.password)
            

            if (!match) return res.status(403).json({
                success: false,
                error: "Invalid Credentials"
            })
            
           
        //Create access and refresh token
        const accesstoken = createAccessToken(user.id)
        const refreshtoken = createRefreshToken(user.id)
         
        
        //set refresh token to user
        await user.updateOne({refreshtoken})
        
        //send access token and refresh token
        sendRefreshToken(res,refreshtoken,user?.username)
        const {password, refreshtoken:reftoken, isAdmin, __v, ...others} = user._doc

        sendAccessToken(res, accesstoken, others)



    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }
}



const logout = (req,res)=> {
    const {username} = req.body
    
    if(!username){
        return res.status(400).json({
            success:false,
            error:'You are unauthorized'        
        })
    }
    res.clearCookie('ref', {path: `api/auth/refresh_token/${req.body.username}`})
    return res.send({
      message: 'Logged out'
    })
}


const refreshToken = async (req,res) =>{
    const token = req.cookies.ref

    //check if token exist
    if(!token){
       return res.status(200).json({
            accesstoken: ''
        })
    }

    //validate token
    let payload;
    try{
      payload = jwt.verify(token,process.env.RTS)

    }catch(error){
      return res.status(400).json({
          accesstoken: '',
      })
    }
    
      //check if user with id exists
      const user = await User.findOne({_id:payload.id})
      .populate('followers','_id firstname lastname username title photo').populate('following', '_id firstname lastname username title photo')
      if(!user){
        return res.status(400).json({
            accesstoken: '',
        })
      }
      
      //if user exists, check if user's refresh token ==! token
      if(user.refreshtoken !== token){
        return res.status(400).json({
            accesstoken: '',
        }) 
      }
    
          //Create access and refresh token
        const accesstoken = createAccessToken(user.id)
        const refreshtoken = createRefreshToken(user.id)

        
        //set refresh token to user
        try{ 
            await user.updateOne({refreshtoken})
        }catch(error){
            return res.status(400).json({
                sucess: false,
                error:error.message
            })
        }       
        //create refresh token and return accesstoken
        sendRefreshToken(res,refreshtoken,user?.username)
        const {password, refreshtoken:reftoken, isAdmin, __v, ...others} = user._doc

        return res.status(200).json({accesstoken,...others})
}

module.exports = {
    login,
    register,
    CompleteRegistration,
    logout,
    refreshToken,
}

