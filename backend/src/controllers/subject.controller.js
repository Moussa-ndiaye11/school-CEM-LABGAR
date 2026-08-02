const prisma = require("../lib/prisma");

async function listSubjects(req, res) {
  const subjects = await prisma.subject.findMany({
    where: { tenantId: req.tenantId },
    orderBy: { name: "asc" },
  });
  res.json(subjects);
}

async function createSubject(req, res) {
  const { name } = req.body;
  const subject = await prisma.subject.create({ data: { tenantId: req.tenantId, name } });
  res.status(201).json(subject);
}

async function updateSubject(req, res) {
  const { name } = req.body;
  const subject = await prisma.subject.update({ where: { id: req.params.id }, data: { name } });
  res.json(subject);
}

async function deleteSubject(req, res) {
  await prisma.subject.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

module.exports = { listSubjects, createSubject, updateSubject, deleteSubject };
