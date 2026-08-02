const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

// GET /api/users?role=TEACHER
async function listUsers(req, res) {
  const { role } = req.query;
  const where = { tenantId: req.tenantId };
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  res.json(users);
}

// POST /api/users  (ADMIN cree un enseignant ou un compte parent)
async function createUser(req, res) {
  const { name, email, phone, password, role } = req.body;

  if (!["TEACHER", "PARENT", "ADMIN"].includes(role)) {
    return res.status(400).json({ message: "Role invalide." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Cet email est deja utilise." });

  const hashed = await bcrypt.hash(password || "changeme123", 10);

  const user = await prisma.user.create({
    data: { tenantId: req.tenantId, name, email, phone, role, password: hashed },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  res.status(201).json(user);
}

// PATCH /api/users/:id
async function updateUser(req, res) {
  const { name, phone, password } = req.body;
  const data = { name, phone };
  if (password) data.password = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  res.json(user);
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
