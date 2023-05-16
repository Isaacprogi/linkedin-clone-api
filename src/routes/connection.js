const router = require('express').Router()
const cookieParser = require('cookie-parser')
const {followAndUnfollowUser, createConnection, acceptConnection, cancelSentConnection,
    removeConnection, getPendingConnections, getPendingSentConnections, rejectConnection, getConnections} = require('../controllers/connection')
const {protect} = require('../middleware/protect')
router.use(cookieParser())


//GET CONNECTIONS
router.route('/').get(protect, getConnections)

//GET PENDING CONNECTIONS
router.route('/pendingConnections').get(protect, getPendingConnections)

//GET PENDING CONNECTIONS
router.route('/pendingSentConnections').get(protect, getPendingSentConnections)


//CREATE CONNECTION
router.route('/followAndUnfollowUser/:id').post(protect,followAndUnfollowUser)

//CREATE CONNECTION
router.route('/createConnection/:id').post(protect,createConnection)

//ACCEPT CONNECTION
router.route('/acceptConnection/:id').post(protect,acceptConnection)

//CANCEL CONNECTION
router.route('/cancelSentConnection/:id').post(protect,cancelSentConnection)

//REMOVE CONNECTION
router.route('/removeConnection/:id').post(protect,removeConnection)

//REJECT CONNECTION
router.route('/rejectConnection/:id').post(protect,rejectConnection)



module.exports = router