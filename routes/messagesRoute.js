const { addMessage, removeMessage, getAllMessage, recommendMessage, updateMessage } = require("../controllers/messagesController");


const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.delete("/removemsg/:id", removeMessage);
router.post("/recommend/:id", recommendMessage);
router.post("/update/:id", updateMessage);
router.post("/getmsg/", getAllMessage);



module.exports = router;
