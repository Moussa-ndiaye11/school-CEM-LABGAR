const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/attendance.controller");

router.use(auth, scopeTenant);

router.get("/", ctrl.listAttendance);
router.post("/bulk", requireRole("ADMIN", "TEACHER"), ctrl.bulkMark);
router.delete("/:id", requireRole("ADMIN", "TEACHER"), ctrl.deleteAttendance);

module.exports = router;
