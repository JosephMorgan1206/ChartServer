const express = require("express");
const app = express(); 
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

dotenv.config();
// app.use(cors());
app.use(express.json());

app.use("https://chart-server-two.vercel.app/api/auth", userRoutes);
app.use("https://chart-server-two.vercel.app/api/message", messageRoute);

//mongoose connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log("DB Connection Successful!")
    }).catch((err) => console.log(err));

 const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server started on Port ${process.env.PORT}`);
});

const io = socket(server,{
    cors: {
        origin: "*",
        credentials: true,
    },
});
//store all online users inside this map
global.onlineUsers =  new Map();
 
io.on("connection",(socket)=>{
    global.chatSocket = socket;
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id);
        io.emit("add-user-recieved",userId);
    });

    socket.on("remove-msg",(data)=>{
        const sendUserSocket = onlineUsers.get(data.receiver);
        if(sendUserSocket) {
            io.to(sendUserSocket).emit("remove-msg-recieved",data);
        }
    });

    socket.on("update-msg",(data)=>{
        const sendUserSocket = onlineUsers.get(data.receiver);
        if(sendUserSocket) {
            io.to(sendUserSocket).emit("update-msg-recieved",data);
        }
    });

    socket.on("send-msg",(data)=>{
        const sendUserSocket = onlineUsers.get(data.receiver);
        if(sendUserSocket) {
            io.to(sendUserSocket).emit("msg-recieved",data);
        }
    });
});
