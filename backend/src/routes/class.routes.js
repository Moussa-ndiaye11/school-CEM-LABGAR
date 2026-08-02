const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/class.controller");

router.use(auth, scopeTenant);

router.get("/", ctrl.listClasses);
router.get("/:id", ctrl.getClass);
router.post("/", requireRole("ADMIN"), ctrl.createClass);
router.patch("/:id", requireRole("ADMIN"), ctrl.updateClass);
router.delete("/:id", requireRole("ADMIN"), ctrl.deleteClass);

module.exports = router;
