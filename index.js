const express = require("express");
const https = require('https');
var fs = require('fs');
const app = express(); 
const cors  = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

var options = {
    ca: [fs.readFileSync(PATH_TO_BUNDLE_CERT_1), fs.readFileSync(PATH_TO_BUNDLE_CERT_2)],
    cert: fs.readFileSync(PATH_TO_CERT),
    key: fs.readFileSync(PATH_TO_KEY)
  };

dotenv.config();
// app.use(cors());
// app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoute);

//mongoose connection
mongoose.connect("mongodb+srv://Administrator:FuZMP6oS56Uaw9AA@cluster0.quzyuwy.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log("DB Connection Successful!")
    }).catch((err) => console.log(err));

    const server = https.createServer(options, app);
 server.listen(process.env.PORT, ()=>{
    console.log(`Server started on Port ${process.env.PORT}`);
});

const io = socket(server);
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
