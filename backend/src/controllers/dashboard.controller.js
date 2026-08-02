const prisma = require("../lib/prisma");

// GET /api/dashboard  (ADMIN)
async function adminDashboard(req, res) {
  const tenantId = req.tenantId;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [studentCount, classCount, teacherCount, todayAttendance, pendingInvoices, overdueInvoices] =
    await Promise.all([
      prisma.student.count({ where: { tenantId } }),
      prisma.schoolClass.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId, role: "TEACHER" } }),
      prisma.attendance.findMany({ where: { tenantId, date: { gte: todayStart, lt: todayEnd } } }),
      prisma.invoice.count({ where: { tenantId, status: "PENDING" } }),
      prisma.invoice.count({ where: { tenantId, status: "OVERDUE" } }),
    ]);

  const present = todayAttendance.filter((a) => a.status === "PRESENT").length;
  const absent = todayAttendance.filter((a) => a.status === "ABSENT").length;

  res.json({
    studentCount,
    classCount,
    teacherCount,
    todayAttendance: { present, absent, marked: todayAttendance.length },
    pendingInvoices,
    overdueInvoices,
  });
}

// GET /api/dashboard/teacher  (TEACHER)
async function teacherDashboard(req, res) {
  const tenantId = req.tenantId;
  const classes = await prisma.schoolClass.findMany({
    where: { tenantId, teacherId: req.user.id },
    include: { _count: { select: { students: true } } },
  });
  res.json({ classes });
}

// GET /api/dashboard/parent  (PARENT)
async function parentDashboard(req, res) {
  const children = await prisma.student.findMany({
    where: { tenantId: req.tenantId, parents: { some: { parentId: req.user.id } } },
    include: {
      class: true,
      invoices: { where: { status: { in: ["PENDING", "OVERDUE"] } } },
    },
  });
  res.json({ children });
}

module.exports = { adminDashboard, teacherDashboard, parentDashboard };
