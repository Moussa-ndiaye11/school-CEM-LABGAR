const prisma = require("../lib/prisma");

async function listClasses(req, res) {
  const classes = await prisma.schoolClass.findMany({
    where: { tenantId: req.tenantId },
    include: {
      teacher: { select: { id: true, name: true } },
      academicYear: true,
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  });
  res.json(classes);
}

async function getClass(req, res) {
  const cls = await prisma.schoolClass.findFirst({
    where: { id: req.params.id, tenantId: req.tenantId },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      academicYear: true,
      students: { orderBy: { lastName: "asc" } },
    },
  });
  if (!cls) return res.status(404).json({ message: "Classe introuvable." });
  res.json(cls);
}

async function createClass(req, res) {
  const { name, level, academicYearId, teacherId } = req.body;
  const cls = await prisma.schoolClass.create({
    data: { tenantId: req.tenantId, name, level, academicYearId, teacherId: teacherId || null },
  });
  res.status(201).json(cls);
}

async function updateClass(req, res) {
  const { name, level, teacherId } = req.body;
  const cls = await prisma.schoolClass.update({
    where: { id: req.params.id },
    data: { name, level, teacherId: teacherId || null },
  });
  res.json(cls);
}

async function deleteClass(req, res) {
  await prisma.schoolClass.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

module.exports = { listClasses, getClass, createClass, updateClass, deleteClass };
