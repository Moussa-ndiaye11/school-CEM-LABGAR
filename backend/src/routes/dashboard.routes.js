const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/dashboard.controller");

router.get("/", auth, scopeTenant, requireRole("ADMIN"), ctrl.adminDashboard);
router.get("/teacher", auth, scopeTenant, requireRole("TEACHER"), ctrl.teacherDashboard);
router.get("/parent", auth, scopeTenant, requireRole("PARENT"), ctrl.parentDashboard);

module.exports = router;
