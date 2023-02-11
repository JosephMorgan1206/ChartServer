const express = require("express");
const app = express(); 
const https = require('https');
const cors  = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require('fs');  

const userRoutes = require("./routes/userRoutes");
const test = require("./routes/test");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

dotenv.config();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', '*');
    res.header("Access-Control-Allow-Origin", "*",);
    res.header("Access-Control-Allow-Methods", "*" );
    res.header("Content-Type" , "text/json");
    next();
  });
app.use("/", test);
app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoute);

// var options = {
//     key: fs.readFileSync('ssl/private/domain.com.key'),
//     cert: fs.readFileSync('ssl/certs/domain.com.crt'),
//     ca: fs.readFileSync('ssl/certs/domain.com.cabundle'),
//     requestCert: false,
//     rejectUnauthorized: false
// };

//mongoose connection
mongoose.connect("mongodb+srv://Administrator:FuZMP6oS56Uaw9AA@cluster0.quzyuwy.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log("DB Connection Successful!")
    }).catch((err) => console.log(err));

const server = https.createServer(app);
    server.listen(5000);

const io = socket(server,{
    // cors: {
    //     origin: "http://localhost:3000",
    //     credentials: true,
    //     methods: ["GET", "POST"],
    //     allowedHeaders: ["my-custom-header"],
    //     transports: ['websocket', 'polling'],
    // },
    allowEIO3: true
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
