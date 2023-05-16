const { allMessages,sendMessage } = require('../controllers/message')
const {protect} = require('../middleware/protect')

const router = require('express').Router()


router.route('/').post(protect,sendMessage)
router.route('/:id').get(protect,allMessages)


module.exports = router


