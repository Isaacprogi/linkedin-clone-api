const router = require('express').Router()
const cookieParser = require('cookie-parser')
const {mediaUploadProfile} = require('../config/multerConfig')
const {getUsers,getUser,deleteUser,updateUser,getUserProfile, getRandomUsers,getAllUserInfo,peopleFromYourCountry,profilePicUpload} = require('../controllers/user')
const {protect} = require('../middleware/protect')
router.use(cookieParser())

//GET ALL USERS
router.route('/').get(protect,getUsers)

//GET ALL USERS
router.route('/random/users').get(protect,getRandomUsers)

//GET SINGLE USER
router.route('/:id').get(protect,getUser)

//GET SINGE USER ALL INFO
router.route('/info/:id').get(protect,getAllUserInfo)

//GET SINGE USER ALL INFO
router.route('/profile/:username').get(protect,getUserProfile)

//Get PEOPLE FROM YOUR STATE
router.route('/category/details').get(protect,peopleFromYourCountry)

//DELETE SINGLE USER
router.route('/:id').delete(protect,deleteUser)

//UPDATE SINGLE USER
router.route('/:id').put(protect,updateUser)

//PROFILE PIC UPLOAD
router.post('/profile-pic',mediaUploadProfile.single('file'), profilePicUpload)




module.exports = router