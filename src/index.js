const express=require('express')
const http = require('http')
const socketio = require('socket.io')
const path=require('path')
const {addUser,removeUser, getUser, getUsersinRoom}=require('./utils/users')
const {generateMessage,generatelocation} = require('./utils/messages')
const { urlencoded } = require('express')
const { use } = require('express/lib/application')
app=express()

const port = process.env.port||3000
const server = http.createServer(app)
const publicPath = path.join(__dirname,'../public')
const io = socketio(server)

app.use(express.static(publicPath))
let count = 0
io.on('connection',(socketio)=>{

    socketio.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socketio.id,username,room})
        if(error)
        {
             return callback(error)
        }
        socketio.join(user.room)
        socketio.emit('message',generateMessage('Admin','Welcome!'))
        socketio.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined the chat `))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersinRoom(user.room)
        })
        callback()
    })
    socketio.on('sendmessage',(text,callback)=>{
        const user = getUser(socketio.id)
        
        io.to(user.room).emit('message',generateMessage(user.username,text))
        callback()
    })
    socketio.on('disconnect',()=>{
        const user = removeUser(socketio.id)
        if(user){
          io.to(user.room).emit('message',generateMessage('Admin',`${user.username} is no longer with us!`))
          io.to(user.room).emit('roomData',{
              room:user.room,
              users:getUsersinRoom(user.room)
         
            })
        }    
    })
    socketio.on('sendlocation',(position,callback)=>{
        const user = getUser(socketio.id)
        io.to(user.room).emit('locationMessage',generatelocation(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

})

server.listen(3000,()=>console.log('server has started'))

