const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { registerSchool, login, me } = require("../controllers/auth.controller");

router.post("/register-school", registerSchool);
router.post("/login", login);
router.get("/me", auth, me);

module.exports = router;
