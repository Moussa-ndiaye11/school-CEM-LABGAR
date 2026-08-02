const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/academicYear.controller");

router.use(auth, scopeTenant);

router.get("/", ctrl.listYears);
router.post("/", requireRole("ADMIN"), ctrl.createYear);

module.exports = router;
