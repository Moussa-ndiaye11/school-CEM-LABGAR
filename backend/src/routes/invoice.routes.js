const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const scopeTenant = require("../middleware/tenant.middleware");
const ctrl = require("../controllers/invoice.controller");

router.use(auth, scopeTenant);

router.get("/", ctrl.listInvoices);
router.post("/", requireRole("ADMIN"), ctrl.createInvoice);
router.patch("/:id", requireRole("ADMIN"), ctrl.updateInvoice);
router.delete("/:id", requireRole("ADMIN"), ctrl.deleteInvoice);
router.post("/:id/payments", requireRole("ADMIN"), ctrl.addPayment);

module.exports = router;
