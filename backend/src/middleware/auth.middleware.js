const { verifyToken } = require("../utils/jwt");
const prisma = require("../lib/prisma");

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentification requise." });
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ message: "Session invalide ou expiree." });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    return res.status(401).json({ message: "Utilisateur introuvable." });
  }

  // Bloque les comptes rattaches a une ecole suspendue
  if (user.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (!tenant || tenant.status !== "ACTIVE") {
      return res.status(403).json({ message: "Cette ecole n'a plus acces a la plateforme." });
    }
  }

  req.user = user;
  next();
}

module.exports = authMiddleware;
