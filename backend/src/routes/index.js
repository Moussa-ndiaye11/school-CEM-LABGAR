const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/tenants", require("./tenant.routes"));
router.use("/users", require("./user.routes"));
router.use("/academic-years", require("./academicYear.routes"));
router.use("/classes", require("./class.routes"));
router.use("/subjects", require("./subject.routes"));
router.use("/students", require("./student.routes"));
router.use("/grades", require("./grade.routes"));
router.use("/attendance", require("./attendance.routes"));
router.use("/invoices", require("./invoice.routes"));
router.use("/dashboard", require("./dashboard.routes"));

module.exports = router;
