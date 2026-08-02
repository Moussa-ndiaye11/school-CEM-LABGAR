const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/user.controller");

router.use(auth, scopeTenant, requireRole("ADMIN"));

router.get("/", ctrl.listUsers);
router.post("/", ctrl.createUser);
router.patch("/:id", ctrl.updateUser);
router.delete("/:id", ctrl.deleteUser);

module.exports = router;
