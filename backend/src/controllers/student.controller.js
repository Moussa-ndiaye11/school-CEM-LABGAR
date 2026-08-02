const prisma = require("../lib/prisma");

// GET /api/students
// ADMIN/TEACHER voient toute l'ecole (avec filtre classId optionnel).
// PARENT ne voit que ses propres enfants.
async function listStudents(req, res) {
  const { classId } = req.query;
  const where = { tenantId: req.tenantId };
  if (classId) where.classId = classId;

  if (req.user.role === "PARENT") {
    where.parents = { some: { parentId: req.user.id } };
  }

  if (req.user.role === "TEACHER" && !classId) {
    where.class = { teacherId: req.user.id };
  }

  const students = await prisma.student.findMany({
    where,
    include: { class: { select: { id: true, name: true, level: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  res.json(students);
}

async function getStudent(req, res) {
  const where = { id: req.params.id, tenantId: req.tenantId };
  if (req.user.role === "PARENT") {
    where.parents = { some: { parentId: req.user.id } };
  }

  const student = await prisma.student.findFirst({
    where,
    include: {
      class: true,
      parents: { include: { parent: { select: { id: true, name: true, email: true, phone: true } } } },
      grades: { include: { subject: true }, orderBy: { date: "desc" } },
      attendances: { orderBy: { date: "desc" }, take: 60 },
      invoices: { include: { payments: true }, orderBy: { dueDate: "desc" } },
    },
  });
  if (!student) return res.status(404).json({ message: "Eleve introuvable." });
  res.json(student);
}

async function createStudent(req, res) {
  const { firstName, lastName, birthDate, gender, classId, parentIds } = req.body;

  const student = await prisma.student.create({
    data: {
      tenantId: req.tenantId,
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      gender,
      classId: classId || null,
      parents: parentIds && parentIds.length
        ? { create: parentIds.map((parentId) => ({ parentId })) }
        : undefined,
    },
    include: { class: true, parents: true },
  });
  res.status(201).json(student);
}

async function updateStudent(req, res) {
  const { firstName, lastName, birthDate, gender, classId } = req.body;
  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: {
      firstName,
      lastName,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      gender,
      classId: classId || null,
    },
  });
  res.json(student);
}

async function deleteStudent(req, res) {
  await prisma.student.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

// POST /api/students/:id/parents  { parentId }
async function linkParent(req, res) {
  const { parentId } = req.body;
  const link = await prisma.studentParent.create({
    data: { studentId: req.params.id, parentId },
  });
  res.status(201).json(link);
}

async function unlinkParent(req, res) {
  await prisma.studentParent.deleteMany({
    where: { studentId: req.params.id, parentId: req.params.parentId },
  });
  res.status(204).send();
}

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  linkParent,
  unlinkParent,
};
