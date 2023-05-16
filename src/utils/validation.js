const Joi = require('joi');

//register validation
const registerValidation = (data) =>{
    const schema  = Joi.object( {
        photo:Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().min(6).required(),  
    }) 
  return schema.validate(data)
}


//login validation
const loginValidation = (data) =>{
    const schema  = Joi.object({
        email: Joi.string().required().email(),
    })
  return schema.validate(data)
}



const registerCompleteValidation = (data) =>{
  const schema  = Joi.object({
      firstname:Joi.string().required(),
      lastname: Joi.string().required(),
      title: Joi.string().required(),
      country: Joi.string().required(),
  })
return schema.validate(data)
}



const userUpdateValidation = (data) =>{
    const schema  = Joi.object({
        firstname: Joi.string().allow(''),
        lastname: Joi.string().allow(''),
        email: Joi.string().email().allow(''),
        password: Joi.string().min(6).required(),
        state: Joi.string().allow(''),
        photo:Joi.string().allow(''),
        country: Joi.string().allow(''),
        street: Joi.string().allow(''),
        phoneNumber: Joi.string().min(3).allow(''),
    })
  return schema.validate(data)
}


//error message
const errorValidateResponse = (res,error) => {
    res.status(401).json({
      error: `${error.details[0].message.split('"')[1]}${error.details[0].message.split('"')[2]}`})         
}

module.exports ={
    registerValidation,
    loginValidation,
    errorValidateResponse,
    userUpdateValidation,
    registerCompleteValidation,
}
