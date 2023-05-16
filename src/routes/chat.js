const router = require('express').Router()
const {protect} = require('../middleware/protect')
const {enterChat,allChats, deleteChat, readChat} = require('../controllers/chat')


router.route('/').post(protect,enterChat)
router.route('/:id').post(protect,readChat)
router.route('/').get(protect,allChats)
router.route('/:id').delete(protect,deleteChat)


module.exports = router
