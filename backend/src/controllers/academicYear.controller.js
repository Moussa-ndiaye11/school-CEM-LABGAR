const prisma = require("../lib/prisma");

async function listYears(req, res) {
  const years = await prisma.academicYear.findMany({
    where: { tenantId: req.tenantId },
    orderBy: { startDate: "desc" },
  });
  res.json(years);
}

async function createYear(req, res) {
  const { name, startDate, endDate, isActive } = req.body;

  if (isActive) {
    await prisma.academicYear.updateMany({
      where: { tenantId: req.tenantId },
      data: { isActive: false },
    });
  }

  const year = await prisma.academicYear.create({
    data: {
      tenantId: req.tenantId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: !!isActive,
    },
  });
  res.status(201).json(year);
}

module.exports = { listYears, createYear };
