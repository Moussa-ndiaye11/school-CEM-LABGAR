const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { signToken } = require("../utils/jwt");

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// POST /api/auth/register-school
// Cree une nouvelle ecole (tenant) + son compte administrateur.
async function registerSchool(req, res) {
  const { schoolName, adminName, email, password, phone } = req.body;

  if (!schoolName || !adminName || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Cet email est deja utilise." });
  }

  let baseSlug = slugify(schoolName);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: schoolName, slug, phone, plan: "BASIC", status: "ACTIVE" },
    });

    const admin = await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: adminName,
        email,
        phone,
        password: hashed,
        role: "ADMIN",
      },
    });

    const year = new Date().getFullYear();
    await tx.academicYear.create({
      data: {
        tenantId: tenant.id,
        name: `${year}-${year + 1}`,
        startDate: new Date(`${year}-09-01`),
        endDate: new Date(`${year + 1}-07-15`),
        isActive: true,
      },
    });

    return { tenant, admin };
  });

  const token = signToken({ id: result.admin.id, role: result.admin.role, tenantId: result.tenant.id });

  res.status(201).json({
    token,
    user: sanitizeUser(result.admin),
    tenant: result.tenant,
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Identifiants incorrects." });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Identifiants incorrects." });
  }

  if (user.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (!tenant || tenant.status !== "ACTIVE") {
      return res.status(403).json({ message: "L'acces de votre ecole est suspendu." });
    }
  }

  const token = signToken({ id: user.id, role: user.role, tenantId: user.tenantId });

  res.json({ token, user: sanitizeUser(user) });
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = { registerSchool, login, me };
