const prisma = require("../lib/prisma");

// GET /api/attendance?classId=&date=&studentId=
async function listAttendance(req, res) {
  const { classId, date, studentId } = req.query;
  const where = { tenantId: req.tenantId };
  if (classId) where.classId = classId;
  if (studentId) where.studentId = studentId;
  if (date) {
    const day = new Date(date);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    where.date = { gte: day, lt: next };
  }

  if (req.user.role === "PARENT") {
    where.student = { parents: { some: { parentId: req.user.id } } };
  }

  const records = await prisma.attendance.findMany({
    where,
    include: { student: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { date: "desc" },
  });
  res.json(records);
}

// POST /api/attendance/bulk
// body: { classId, date, records: [{ studentId, status, note }] }
async function bulkMark(req, res) {
  const { classId, date, records } = req.body;
  const day = new Date(date);

  const results = await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date: day } },
        update: { status: r.status, note: r.note },
        create: {
          tenantId: req.tenantId,
          studentId: r.studentId,
          classId,
          date: day,
          status: r.status,
          note: r.note,
        },
      })
    )
  );

  res.status(201).json(results);
}

async function deleteAttendance(req, res) {
  await prisma.attendance.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

module.exports = { listAttendance, bulkMark, deleteAttendance };
