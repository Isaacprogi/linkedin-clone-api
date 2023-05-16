
const socket = (io) => {
  io.on('connection', (socket)=>{
      
      socket.on("setup", (userData)=>{
        socket.join(userData._id)
        socket.emit("connected")
      })
  
  
      socket.on("new message", (newMessageRecieved) => {
  
        var chat = newMessageRecieved[0].chat;
  
        if(!chat.users) return console.log('chat.users not defined')
  
        chat.users.forEach(user=>{      
          if(user._id === newMessageRecieved[0]?.sender._id){
            return
          } 
          socket.to(user._id).emit("message recieved", newMessageRecieved)
  
        }) 
  
      })
  
      socket.on("chat_delete_request", (chat,userId) => {
        if(!chat?.users) return console.log('chat.users not defined')
        chat?.users?.forEach(user=>{      
          if(user?._id === userId ){
            return
          } 
          socket.to(user?._id).emit("chat_delete_request_recieved", chat?._id)
  
        }) 
  
      })
      
  })
}

module.exports = socket