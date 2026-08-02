const prisma = require("../lib/prisma");
const PDFDocument = require("pdfkit");

// GET /api/grades?studentId=&classId=&term=
async function listGrades(req, res) {
  const { studentId, classId, term } = req.query;
  const where = { tenantId: req.tenantId };
  if (studentId) where.studentId = studentId;
  if (term) where.term = term;
  if (classId) where.student = { classId };

  if (req.user.role === "PARENT") {
    where.student = { ...(where.student || {}), parents: { some: { parentId: req.user.id } } };
  }

  const grades = await prisma.grade.findMany({
    where,
    include: {
      subject: true,
      student: { select: { id: true, firstName: true, lastName: true, classId: true } },
    },
    orderBy: { date: "desc" },
  });
  res.json(grades);
}

async function createGrade(req, res) {
  const { studentId, subjectId, value, maxValue, term, comment, date } = req.body;
  const grade = await prisma.grade.create({
    data: {
      tenantId: req.tenantId,
      studentId,
      subjectId,
      value: parseFloat(value),
      maxValue: maxValue ? parseFloat(maxValue) : 20,
      term,
      comment,
      date: date ? new Date(date) : new Date(),
    },
    include: { subject: true },
  });
  res.status(201).json(grade);
}

async function updateGrade(req, res) {
  const { value, maxValue, comment, term } = req.body;
  const grade = await prisma.grade.update({
    where: { id: req.params.id },
    data: {
      value: value !== undefined ? parseFloat(value) : undefined,
      maxValue: maxValue !== undefined ? parseFloat(maxValue) : undefined,
      comment,
      term,
    },
  });
  res.json(grade);
}

async function deleteGrade(req, res) {
  await prisma.grade.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

// GET /api/grades/report-card/:studentId?term=
// Moyenne par matiere pour bulletin
async function reportCard(req, res) {
  const { studentId } = req.params;
  const { term } = req.query;
  const where = { tenantId: req.tenantId, studentId };
  if (term) where.term = term;

  const grades = await prisma.grade.findMany({ where, include: { subject: true } });

  const bySubject = {};
  grades.forEach((g) => {
    const key = g.subject.id;
    if (!bySubject[key]) {
      bySubject[key] = { subject: g.subject.name, total: 0, totalMax: 0, count: 0 };
    }
    bySubject[key].total += g.value;
    bySubject[key].totalMax += g.maxValue;
    bySubject[key].count += 1;
  });

  const report = Object.values(bySubject).map((s) => ({
    subject: s.subject,
    average: s.count ? ((s.total / s.totalMax) * 20).toFixed(2) : null,
    numberOfGrades: s.count,
  }));

  res.json({ studentId, term: term || "toutes periodes", subjects: report });
}

// GET /api/grades/report-card/:studentId/pdf?term=
// Genere un bulletin PDF telechargeable pour l'eleve.
async function reportCardPdf(req, res) {
  const { studentId } = req.params;
  const { term } = req.query;
  const tenantId = req.tenantId;

  const studentWhere = { id: studentId, tenantId };
  if (req.user.role === "PARENT") {
    studentWhere.parents = { some: { parentId: req.user.id } };
  }

  const student = await prisma.student.findFirst({ where: studentWhere, include: { class: true } });
  if (!student) return res.status(404).json({ message: "Eleve introuvable." });

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  const gradeWhere = { tenantId, studentId };
  if (term) gradeWhere.term = term;

  const grades = await prisma.grade.findMany({ where: gradeWhere, include: { subject: true } });

  const bySubject = {};
  grades.forEach((g) => {
    const key = g.subject.id;
    if (!bySubject[key]) bySubject[key] = { subject: g.subject.name, total: 0, totalMax: 0, count: 0 };
    bySubject[key].total += g.value;
    bySubject[key].totalMax += g.maxValue;
    bySubject[key].count += 1;
  });
  const subjects = Object.values(bySubject);

  const overallTotal = subjects.reduce((s, x) => s + x.total, 0);
  const overallMax = subjects.reduce((s, x) => s + x.totalMax, 0);
  const overallAverage = overallMax ? (overallTotal / overallMax) * 20 : null;

  const filename = `bulletin-${student.lastName}-${student.firstName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  doc.font("Helvetica-Bold").fontSize(18).text(tenant.name, { align: "center" });
  const infoLine = [tenant.address, tenant.phone, tenant.email].filter(Boolean).join("  ·  ");
  if (infoLine) {
    doc.font("Helvetica").fontSize(9).fillColor("#555555").text(infoLine, { align: "center" });
  }
  doc.fillColor("#000000").moveDown(1.2);

  doc.font("Helvetica-Bold").fontSize(15).text("Bulletin scolaire", { align: "center" });
  doc.moveDown(1.2);

  doc.font("Helvetica").fontSize(11);
  doc.text(`Eleve : ${student.firstName} ${student.lastName}`);
  doc.text(`Classe : ${student.class ? `${student.class.name} (${student.class.level})` : "Non assignee"}`);
  doc.text(`Periode : ${term || "Toutes periodes"}`);
  doc.text(`Date d'edition : ${new Date().toLocaleDateString("fr-FR")}`);
  doc.moveDown(1);

  const col1 = 50, col2 = 300, col3 = 400, col4 = 480;
  const tableTop = doc.y;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Matiere", col1, tableTop);
  doc.text("Nb notes", col2, tableTop);
  doc.text("Moyenne", col3, tableTop);
  doc.text("/20", col4, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  let y = tableTop + 22;
  doc.font("Helvetica").fontSize(10);

  if (subjects.length === 0) {
    doc.text("Aucune note enregistree pour cette periode.", col1, y);
    y += 20;
  }

  subjects.forEach((s) => {
    const avg = s.count ? ((s.total / s.totalMax) * 20).toFixed(2) : "-";
    doc.text(s.subject, col1, y);
    doc.text(String(s.count), col2, y);
    doc.text(avg, col3, y);
    y += 18;
  });

  doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
  y += 18;

  doc.font("Helvetica-Bold").fontSize(12);
  doc.text(`Moyenne generale : ${overallAverage !== null ? overallAverage.toFixed(2) : "-"} / 20`, col1, y);

  const bottomY = 720;
  doc.font("Helvetica").fontSize(10);
  doc.text("Le Directeur / La Directrice", 50, bottomY);
  doc.text("Le Parent", 400, bottomY);

  doc.end();
}

module.exports = { listGrades, createGrade, updateGrade, deleteGrade, reportCard, reportCardPdf };
