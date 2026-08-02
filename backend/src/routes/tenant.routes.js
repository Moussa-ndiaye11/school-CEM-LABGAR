const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const ctrl = require("../controllers/tenant.controller");

router.use(auth, requireRole("SUPER_ADMIN"));

router.get("/stats/overview", ctrl.overview);
router.get("/", ctrl.listTenants);
router.get("/:id", ctrl.getTenant);
router.patch("/:id", ctrl.updateTenant);
router.delete("/:id", ctrl.deleteTenant);

module.exports = router;
