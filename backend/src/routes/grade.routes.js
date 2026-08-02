const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/grade.controller");

router.use(auth, scopeTenant);

router.get("/", ctrl.listGrades);
router.get("/report-card/:studentId/pdf", ctrl.reportCardPdf);
router.get("/report-card/:studentId", ctrl.reportCard);
router.post("/", requireRole("ADMIN", "TEACHER"), ctrl.createGrade);
router.patch("/:id", requireRole("ADMIN", "TEACHER"), ctrl.updateGrade);
router.delete("/:id", requireRole("ADMIN", "TEACHER"), ctrl.deleteGrade);

module.exports = router;
