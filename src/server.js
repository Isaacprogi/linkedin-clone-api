require('dotenv/config')
const express = require('express')
const app = express()
const http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')
const connectDB = require('./db/db')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const mediaRoute = require('./routes/media')
const chatRoute = require('./routes/chat')
const messageRoute = require('./routes/message')
const commentRoute = require('./routes/comment')
const postRoute = require('./routes/post')
const connectionRoute = require('./routes/connection')
const navAlertRoute = require('./routes/navAlert')
const path = require('path')
const errorHandler = require('./middleware/errorHandler')
const socket = require('./config/socket')
const User = require('./models/User')




//origin construction


//middle wares
app.use(cors({
  origin: 'https://itslinkedinclone.onrender.com',
  preflightContinue: false,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}))

// app.use("/public", express.static(path.join(__dirname, "/public")))

app.use(express.json({limit:'50mb'})); //to support JSON-encoded bodies
app.use(express.urlencoded({limit:'50mb',extended: true})) //support URL-encoded bodies


app.use('/api/auth',authRoute)
app.use('/api/user',userRoute)
app.use('/api/media',mediaRoute)
app.use('/api/chat', chatRoute)
app.use('/api/message', messageRoute)
app.use('/api/connection', connectionRoute)
app.use('/api/post', postRoute)
app.use('/api/comment', commentRoute)
app.use('/api/nav-alert',navAlertRoute )



app.use(errorHandler)

//connect data base
connectDB(process.env.MONGO_URL)

const server = http.createServer(app)

const io = new Server(server,{
    cors: {
      origin: 'https://itslinkedinclone.onrender.com'
    },
  })

socket(io)
  

server.listen(process.env.PORT , ()=>{
  console.log('SERVER IS RUNNING')
})




