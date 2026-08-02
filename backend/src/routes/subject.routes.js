const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/subject.controller");

router.use(auth, scopeTenant);

router.get("/", ctrl.listSubjects);
router.post("/", requireRole("ADMIN"), ctrl.createSubject);
router.patch("/:id", requireRole("ADMIN"), ctrl.updateSubject);
router.delete("/:id", requireRole("ADMIN"), ctrl.deleteSubject);

module.exports = router;
