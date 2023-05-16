const express = require('express')
const media = require('../controllers/media')
const multer = require('multer');
const fs = require('fs')
const path = require('path');



const IMAGESTORAGE = multer.diskStorage({
    destination:(req,file,cb) => {
        if(!fs.existsSync("public")){
            fs.mkdirSync("public")
        }
        if(!fs.existsSync("public/images")){
           fs.mkdirSync("public/images")
        }
        
        cb(null,"public/images")

    }, filename:(req,file,cb) =>{
        cb(null, req.body.name)
    },
})


const IMAGEUPLOAD = multer({storage:IMAGESTORAGE,
    fileFilter:(req,file,cb)=>{
        var ext = path.extname(file.originalname)
        if(ext !== '.jpeg' && ext !== '.png' && ext !== '.jpg'){
            return cb(new Error('only images are allowed'))
        }

        cb(null, true)
    }
})

const router = express.Router();

router.post('/image', IMAGEUPLOAD.single('file'), media.imageUpload)


module.exports = router;
