const messageModel = require("../models/messageModel");
const userModel = require("../models/userModel");

module.exports.addMessage = async (req, res, next) => {
    try {
        const {sender, message, receiver, reply, time} = req.body;

        const data = await messageModel.create({
            message:{
                text: message
            },
            sender: sender,
            receiver: receiver,
            reply: reply? reply._id : null,
            time: time
        });

        const messages = await messageModel.find({ 
            $or:[ 
                { $and: [ {'sender':sender}, {'receiver':receiver} ]}, 
                { $and: [ {'sender':receiver}, {'receiver':sender} ]} 
            ]}).populate('reply').limit(100).sort({ createdAt: 1 });

        if(data) return res.json(messages);
        return res.json({ 
            msg: "Failed to add message to DB"
        });

    } catch (err) {
        next(err);
    }
};

module.exports.removeMessage = async (req, res, next) => {
    messageModel.findByIdAndDelete(req.params.id, (err, docs)=>{
        if(err){
            return res.status(500).send({error: "delete error "})
        }
        return res.status(200).send({msg: true});
    })
};

module.exports.recommendMessage = async (req, res, next) => {
    messageModel.findByIdAndUpdate(req.params.id, {recommend: true}, (err, docs)=>{
        if(err){
            return res.status(500).send({error: "delete error "})
        }
        return res.status(200).send({msg: true});
    })
};

module.exports.updateMessage = async (req, res, next) => {
    const {message, time} = req.body;
    messageModel.findByIdAndUpdate(req.params.id, { message:{text: message}, time: time } , (err, docs)=>{
        if(err){
            return res.status(500).send({error: "update error "})
        }
        return res.status(200).send({msg: true});
    })
}

// module.exports.getAllMessage = async (req, res, next) => {
//     try {
//         const messages = await messageModel.find().limit(100).sort({ updatedAt: -1 });

//         const projectMessages = await Promise.all(messages.sort((a,b) => {
//             return a.updatedAt.getTime() - b.updatedAt.getTime()
//         }).map(async(msg)=>{
//             const user = await userModel.findOne({ '_id' : msg.sender})
//             return{
//                 message: msg.message.text,
//                 sender: user,
//                 updatedAt: msg.updatedAt
//             };
//         }));

//         res.json(projectMessages);
//     } catch (error) {
//         next(error);
//     }
// };

module.exports.getAllMessage = async (req, res, next) => {
    try {
        const {sender, receiver} = req.body;
        const messages = await messageModel.find({ 
            $or:[ 
                { $and: [ {'sender':sender}, {'receiver':receiver} ]}, 
                { $and: [ {'sender':receiver}, {'receiver':sender} ]} 
            ]}).populate('reply').limit(100).sort({ createdAt: 1 });

        // const messages = await messageModel.find().limit(100).sort({ updatedAt: -1 });

        // const projectMessages = await Promise.all(messages.sort((a,b) => {
        //     return a.updatedAt.getTime() - b.updatedAt.getTime()
        // }).map(async(msg)=>{
        //     const user = await userModel.findOne({ '_id' : msg.sender})
        //     return{
        //         message: msg.message.text,
        //         sender: user,
        //         updatedAt: msg.updatedAt
        //     };
        // }));
        let options = { multi: true, upsert: true };

        await messageModel.updateMany({
            sender: sender, receiver: receiver
        } , { $set: { "checked": true } }, {multi: true} );

        res.json(messages);
    } catch (error) {
        next(error);
    }
};

