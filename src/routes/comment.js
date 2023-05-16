const express = require('express')
const router = express.Router()
const {protect} = require('../middleware/protect')
const {addComment, deleteComment} = require('../controllers/comment')
const cookieParser = require('cookie-parser')
router.use(cookieParser())


router.post('/:id', protect, addComment)
router.route('/:id').put(protect,deleteComment)



module.exports = router