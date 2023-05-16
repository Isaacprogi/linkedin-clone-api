const NavAlert = require('../models/NavAlert')



const getUserNavAlert = async(req,res,next) => {
    if(!req.params.userId){
        return next(new Error('missing requirements'))
    }
try{
  const alert = await NavAlert.find({user:req.params.userId,new:true})
  if(alert){
      return res.status(200).json(alert)
  }
  return res.status(400).json(new Error("dosent exist"))
}catch(error){
  next(error)
}
}


const newNavAlert = async(req,res,next) => {
          if(!req.body.userId || !req.body.category || !req.body.from){
              return next(new Error('missing requirements'))
          }
    try{
        const alert = await NavAlert.findOne({user:req.body.userId, category:req.body.category})
        if(alert){
            if(alert.from.includes(req.body.from)){
                alert.new = true
                await alert.save()
                return res.status(200).json(alert)
            }
            if(!alert.from.includes(req.body.from)){
                alert.new = true
                alert.from.push(req.body.from)
                await alert.save()
                return res.status(200).json(alert)
            }

        }
        const newAlert = await NavAlert.create({
            category:req.body.category,
            user:req.body.userId,
            from:[req.body.from]
        })
        return res.status(200).json(newAlert)
    }catch(error){
        next(error)
    }
}



const updateAlert = async(req,res,next) => {
          if(!req.body.userId || !req.body.category){
              return next(new Error('missing requirements'))
          }
    try{
        const alert = await NavAlert.findOne({user:req.body.userId, category:req.body.category})

        if(alert){
            alert.new = false
            alert.from = []
            await alert.save()
            return res.status(200).json(alert)
        }
        return next(new Error('no alert to update'))
    }catch(error){
        next(error)
    }
}




module.exports = {
    newNavAlert,
    updateAlert,
    getUserNavAlert
}