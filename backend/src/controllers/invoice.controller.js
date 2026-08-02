const prisma = require("../lib/prisma");

async function markOverdueIfNeeded(tenantId) {
  await prisma.invoice.updateMany({
    where: { tenantId, status: "PENDING", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });
}

// GET /api/invoices?studentId=&status=
async function listInvoices(req, res) {
  await markOverdueIfNeeded(req.tenantId);

  const { studentId, status } = req.query;
  const where = { tenantId: req.tenantId };
  if (studentId) where.studentId = studentId;
  if (status) where.status = status;

  if (req.user.role === "PARENT") {
    where.student = { parents: { some: { parentId: req.user.id } } };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      payments: true,
    },
    orderBy: { dueDate: "desc" },
  });
  res.json(invoices);
}

async function createInvoice(req, res) {
  const { studentId, description, amount, dueDate } = req.body;
  const invoice = await prisma.invoice.create({
    data: {
      tenantId: req.tenantId,
      studentId,
      description,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
    },
  });
  res.status(201).json(invoice);
}

async function updateInvoice(req, res) {
  const { description, amount, dueDate, status } = req.body;
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: {
      description,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status,
    },
  });
  res.json(invoice);
}

async function deleteInvoice(req, res) {
  await prisma.invoice.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

// POST /api/invoices/:id/payments  { amount, method, reference }
async function addPayment(req, res) {
  const { amount, method, reference } = req.body;
  const invoiceId = req.params.id;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, tenantId: req.tenantId },
    include: { payments: true },
  });
  if (!invoice) return res.status(404).json({ message: "Facture introuvable." });

  const payment = await prisma.payment.create({
    data: { invoiceId, amount: parseFloat(amount), method, reference },
  });

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + payment.amount;
  const newStatus = totalPaid >= invoice.amount ? "PAID" : "PENDING";

  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } });

  res.status(201).json(payment);
}

module.exports = { listInvoices, createInvoice, updateInvoice, deleteInvoice, addPayment };
