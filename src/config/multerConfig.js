const multer = require('multer')
const fs = require('fs')
  
const mediaStorage = multer.diskStorage({})

  
const uploadFilter = (req,file,cb) => { 
   if(file.mimetype.split('/')[0] === 'image') {
      return cb(null,true)
    } 
   if(file.mimetype.split('/')[0] === 'video') {
      return cb(null,true)
    } 
    cb(new multer.MulterError(code === "LIMIT_UNEXPECTED_FILE"), false)   
}

const uploadFilterProfile = (req,file,cb) => { 
   if(file.mimetype.split('/')[0] === 'image') {
      return cb(null,true)
    } 
    cb(new multer.MulterError(code === "LIMIT_UNEXPECTED_FILE"), false)   
}


const mediaUpload = multer({storage:mediaStorage,fileFilter:uploadFilter})
const mediaUploadProfile = multer({storage:mediaStorage,fileFilter:uploadFilterProfile})


module.exports = {mediaUpload,mediaUploadProfile}
  