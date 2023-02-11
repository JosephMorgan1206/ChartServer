const express = require("express");
const app = express(); 
const cors  = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

dotenv.config();
app.use(express.json());


app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoute);

//mongoose connection
mongoose.connect("mongodb+srv://Administrator:FuZMP6oS56Uaw9AA@cluster0.quzyuwy.mongodb.net/?retryWrites=true&w=majority", {
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
        origin: "https://hansxyx.com",
        credentials: true,
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
    },
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
