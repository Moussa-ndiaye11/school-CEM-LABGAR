// Attache le tenantId de l'utilisateur connecte a la requete.
// Le SUPER_ADMIN n'est rattache a aucune ecole : il doit gerer les
// tenants via les routes dediees /api/tenants.
function scopeTenant(req, res, next) {
  if (req.user.role === "SUPER_ADMIN") {
    return next();
  }

  if (!req.user.tenantId) {
    return res.status(403).json({ message: "Ce compte n'est rattache a aucune ecole." });
  }

  req.tenantId = req.user.tenantId;
  next();
}

module.exports = scopeTenant;
