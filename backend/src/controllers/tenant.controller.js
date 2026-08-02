const prisma = require("../lib/prisma");

// GET /api/tenants  (SUPER_ADMIN)
async function listTenants(req, res) {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { students: true, users: true, classes: true } },
    },
  });
  res.json(tenants);
}

// GET /api/tenants/:id
async function getTenant(req, res) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { students: true, users: true, classes: true } } },
  });
  if (!tenant) return res.status(404).json({ message: "Ecole introuvable." });
  res.json(tenant);
}

// PATCH /api/tenants/:id  (plan, status)
async function updateTenant(req, res) {
  const { plan, status, name, address, phone, email } = req.body;
  const tenant = await prisma.tenant.update({
    where: { id: req.params.id },
    data: { plan, status, name, address, phone, email },
  });
  res.json(tenant);
}

// DELETE /api/tenants/:id
async function deleteTenant(req, res) {
  await prisma.tenant.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

// GET /api/tenants/stats/overview  (SUPER_ADMIN dashboard)
async function overview(req, res) {
  const [tenants, students, users, activeTenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.student.count(),
    prisma.user.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
  ]);

  const byPlan = await prisma.tenant.groupBy({ by: ["plan"], _count: { plan: true } });

  res.json({
    totalSchools: tenants,
    activeSchools: activeTenants,
    totalStudents: students,
    totalUsers: users,
    byPlan: byPlan.map((p) => ({ plan: p.plan, count: p._count.plan })),
  });
}

module.exports = { listTenants, getTenant, updateTenant, deleteTenant, overview };
