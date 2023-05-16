const { newNavAlert, updateAlert, getUserNavAlert} = require('../controllers/navAlert')
const {protect} = require('../middleware/protect')

const router = require('express').Router()


router.route('/:userId').get(protect,getUserNavAlert)
router.route('/').post(protect,newNavAlert)
router.route('/').put(protect,updateAlert)


module.exports = router


