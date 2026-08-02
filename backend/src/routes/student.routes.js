const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/student.controller");

router.use(auth, scopeTenant);

router.get("/", ctrl.listStudents);
router.get("/:id", ctrl.getStudent);
router.post("/", requireRole("ADMIN"), ctrl.createStudent);
router.patch("/:id", requireRole("ADMIN"), ctrl.updateStudent);
router.delete("/:id", requireRole("ADMIN"), ctrl.deleteStudent);
router.post("/:id/parents", requireRole("ADMIN"), ctrl.linkParent);
router.delete("/:id/parents/:parentId", requireRole("ADMIN"), ctrl.unlinkParent);

module.exports = router;
