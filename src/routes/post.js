const express = require('express')
const router = express.Router()
const {mediaUpload} = require('../config/multerConfig')
const {protect} = require('../middleware/protect')
const {getPosts, addPost,  updatePost, deletePost, likePost, repostPost, postFileUpload} = require('../controllers/post')
const cookieParser = require('cookie-parser')
router.use(cookieParser())



router.get('/', protect, getPosts)
router.post('/', protect, addPost)
router.route('/:id').put(protect,updatePost)
router.route('/:id').delete(protect,deletePost)
router.route('/like/:id').put(protect,likePost)
router.route('/repost/:id').put(protect,repostPost)



//post media upload
router.post('/file', protect, mediaUpload.single('file'), postFileUpload)




module.exports = router