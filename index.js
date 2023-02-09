const express = require("express");
const app = express(); 
const cors  = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoute);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//mongoose connection
//mongodb+srv://kazamaChatNode:AJYb9mmxOr4MMqsR@cluster0.ztywcu2.mongodb.net/?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://Administrator:FuZMP6oS56Uaw9AA@cluster0.quzyuwy.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log("DB Connection Successful!")
    }).catch((err) => console.log(err));

    // mongoose.connect('mongodb://127.0.0.1:27017/db');

const server = app.listen(process.env.PORT || 5000, ()=>{
    console.log(`Chat server started at port: ${process.env.PORT}`);
});

// const requestListener = function (req, res) {};

// const server = http.createServer(requestListener);

const io = socket(server,{
    cors: {
        origin: "https://hansxyx.com",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true,
    },
    allowEIO3: true
});

// const io = socket(server,{
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"],
//         transports: ['websocket', 'polling'],
//         credentials: true,
//     },
//     allowEIO3: true
// });
//store all online users inside this map
global.onlineUsers =  new Map();
 
io.on("connection", (socket)=>{
    global.chatSocket = socket;

    socket.on("add-user",(data)=>{
        onlineUsers.set(data._id, socket.id);
        console.log("gggggggggggggggg", socket.id);
        socket.broadcast.emit("add-user-recieved",data);
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
            io.to(sendUserSocket).emit("add-msg-recieved",data);
        }
    });
});
