const { register, loginOrRegister, setUserName, setAvatar,setKraken, setWhale, setShark, setDolphin, setTurtle, setHolder, setLiquidityProvider, getAllUsers, getUser, isValidName } = require("../controllers/usersController");
const { login } = require("../controllers/usersController");
const { logOut } = require("../controllers/usersController");

const router = require("express").Router();

// router.post("/register", register);
router.post("/connect", loginOrRegister);
router.post("/getUser", getUser);
router.post("/isValidName", isValidName);
router.post("/setAvatar/", setAvatar);
router.post("/setKraken/:id", setKraken);
router.post("/setWhale/:id", setWhale);
router.post("/setShark/:id", setShark);
router.post("/setDolphin/:id", setDolphin);
router.post("/setTurtle/:id", setTurtle);
router.post("/setHolder/:id", setHolder);
router.post("/setLiquidityProvider/:id", setLiquidityProvider);
router.post("/setUserName", setUserName);
router.post("/allUsers/:id", getAllUsers);
router.get("/logout/:id", logOut);

module.exports = router;
