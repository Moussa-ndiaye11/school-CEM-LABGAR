const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.studentParent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.schoolClass.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  console.log("Creation du super admin...");
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@ecole-saas.com",
      password: hash("password123"),
      role: "SUPER_ADMIN",
    },
  });

  console.log("Creation de l'ecole demo...");
  const tenant = await prisma.tenant.create({
    data: {
      name: "Ecole Primaire Les Petits Genies",
      slug: "les-petits-genies",
      address: "12 Avenue des Ecoliers, Abidjan",
      phone: "+225 07 00 00 00",
      email: "contact@petitsgenies.com",
      plan: "STANDARD",
      status: "ACTIVE",
    },
  });

  const year = await prisma.academicYear.create({
    data: {
      tenantId: tenant.id,
      name: "2025-2026",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-07-15"),
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Aminata Kone",
      email: "admin@petitsgenies.com",
      password: hash("password123"),
      phone: "+225 07 11 11 11",
      role: "ADMIN",
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "M. Jean Bakayoko",
      email: "teacher@petitsgenies.com",
      password: hash("password123"),
      phone: "+225 07 22 22 22",
      role: "TEACHER",
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Mme Fatou Diarra",
      email: "fatou@petitsgenies.com",
      password: hash("password123"),
      role: "TEACHER",
    },
  });

  const parent1 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Moussa Traore",
      email: "parent@petitsgenies.com",
      password: hash("password123"),
      phone: "+225 07 33 33 33",
      role: "PARENT",
    },
  });

  const parent2 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Awa Sangare",
      email: "awa@petitsgenies.com",
      password: hash("password123"),
      role: "PARENT",
    },
  });

  console.log("Creation des classes...");
  const classCE1 = await prisma.schoolClass.create({
    data: { tenantId: tenant.id, name: "CE1 A", level: "CE1", academicYearId: year.id, teacherId: teacher1.id },
  });
  const classCM2 = await prisma.schoolClass.create({
    data: { tenantId: tenant.id, name: "CM2 A", level: "CM2", academicYearId: year.id, teacherId: teacher2.id },
  });

  console.log("Creation des matieres...");
  const subjects = await Promise.all(
    ["Francais", "Mathematiques", "Sciences", "Histoire-Geographie", "Education Civique"].map((name) =>
      prisma.subject.create({ data: { tenantId: tenant.id, name } })
    )
  );

  console.log("Creation des eleves...");
  const student1 = await prisma.student.create({
    data: {
      tenantId: tenant.id,
      firstName: "Ibrahim",
      lastName: "Traore",
      birthDate: new Date("2017-03-12"),
      gender: "M",
      classId: classCE1.id,
      parents: { create: [{ parentId: parent1.id }] },
    },
  });

  const student2 = await prisma.student.create({
    data: {
      tenantId: tenant.id,
      firstName: "Mariam",
      lastName: "Sangare",
      birthDate: new Date("2014-06-20"),
      gender: "F",
      classId: classCM2.id,
      parents: { create: [{ parentId: parent2.id }] },
    },
  });

  const student3 = await prisma.student.create({
    data: {
      tenantId: tenant.id,
      firstName: "Kader",
      lastName: "Traore",
      birthDate: new Date("2015-11-02"),
      gender: "M",
      classId: classCE1.id,
      parents: { create: [{ parentId: parent1.id }] },
    },
  });

  console.log("Creation des notes...");
  for (const student of [student1, student2, student3]) {
    for (const subject of subjects) {
      await prisma.grade.create({
        data: {
          tenantId: tenant.id,
          studentId: student.id,
          subjectId: subject.id,
          value: Math.round((Math.random() * 8 + 11) * 100) / 100,
          maxValue: 20,
          term: "Trimestre 1",
        },
      });
    }
  }

  console.log("Creation des presences...");
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);

    await prisma.attendance.create({
      data: {
        tenantId: tenant.id,
        studentId: student1.id,
        classId: classCE1.id,
        date: day,
        status: i === 1 ? "ABSENT" : "PRESENT",
      },
    });
    await prisma.attendance.create({
      data: {
        tenantId: tenant.id,
        studentId: student2.id,
        classId: classCM2.id,
        date: day,
        status: "PRESENT",
      },
    });
  }

  console.log("Creation des factures...");
  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      studentId: student1.id,
      description: "Frais de scolarite - Trimestre 1",
      amount: 75000,
      dueDate: new Date("2025-10-15"),
      status: "PAID",
      payments: { create: [{ amount: 75000, method: "MOBILE_MONEY", reference: "MM-20251001" }] },
    },
  });

  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      studentId: student2.id,
      description: "Frais de scolarite - Trimestre 2",
      amount: 75000,
      dueDate: new Date("2026-01-15"),
      status: "PENDING",
    },
  });

  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      studentId: student3.id,
      description: "Frais de cantine - Trimestre 1",
      amount: 25000,
      dueDate: new Date("2025-10-01"),
      status: "OVERDUE",
    },
  });

  console.log("\nComptes de demonstration:");
  console.log("Super admin : superadmin@ecole-saas.com / password123");
  console.log("Admin ecole : admin@petitsgenies.com / password123");
  console.log("Enseignant  : teacher@petitsgenies.com / password123");
  console.log("Parent      : parent@petitsgenies.com / password123");
  console.log("\nTermine !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
