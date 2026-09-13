/**
 * Dev/demo seed data for the Internal Transfer Request feature. Not part of any Spec
 * Acceptance Criteria - purely to make the app explorable in a browser. Idempotent
 * (upserts / delete-then-recreate), safe to re-run with `npx prisma db seed`.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const monthsAgo = (n: number) => new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function upsertRef(model: "department" | "location" | "role", id: string, name: string) {
  return (prisma[model] as any).upsert({ where: { id }, create: { id, name }, update: { name } });
}

async function main() {
  console.log("Seeding demo data...");

  // Remove the old minimal ad-hoc rows from earlier manual seeding, if present, so this
  // becomes the single source of demo data rather than leaving two overlapping sets around.
  // Includes any real TransferRequest(s) a user created against that throwaway data (e.g.
  // employeeId "emp-1") - those reference dept-a/dept-b etc. via foreign key and must go
  // first, or the reference-data cleanup below fails.
  const oldAdhocRequests = await prisma.transferRequest.findMany({ where: { employeeId: "emp-1" } });
  for (const r of oldAdhocRequests) {
    await prisma.auditEvent.deleteMany({ where: { requestId: r.id } });
    await prisma.fulfilmentTask.deleteMany({ where: { requestId: r.id } });
    await prisma.hrDecision.deleteMany({ where: { requestId: r.id } });
    await prisma.managerDecision.deleteMany({ where: { requestId: r.id } });
  }
  await prisma.transferRequest.deleteMany({ where: { employeeId: "emp-1" } });
  await prisma.employeeProfileSeed.deleteMany({ where: { employeeId: "emp-1" } });
  for (const id of ["dept-a", "dept-b", "loc-a", "loc-b", "role-a", "role-b"]) {
    await prisma.department.deleteMany({ where: { id } });
    await prisma.location.deleteMany({ where: { id } });
    await prisma.role.deleteMany({ where: { id } });
  }

  const departments = {
    engineering: await upsertRef("department", "dept-engineering", "Engineering"),
    sales: await upsertRef("department", "dept-sales", "Sales"),
    marketing: await upsertRef("department", "dept-marketing", "Marketing"),
    hr: await upsertRef("department", "dept-hr", "Human Resources"),
    finance: await upsertRef("department", "dept-finance", "Finance"),
  };
  const locations = {
    london: await upsertRef("location", "loc-london", "London"),
    manchester: await upsertRef("location", "loc-manchester", "Manchester"),
    birmingham: await upsertRef("location", "loc-birmingham", "Birmingham"),
    edinburgh: await upsertRef("location", "loc-edinburgh", "Edinburgh"),
  };
  const roles = {
    swe: await upsertRef("role", "role-swe", "Software Engineer"),
    seniorSwe: await upsertRef("role", "role-senior-swe", "Senior Software Engineer"),
    engManager: await upsertRef("role", "role-eng-manager", "Engineering Manager"),
    salesExec: await upsertRef("role", "role-sales-exec", "Sales Executive"),
    marketingSpecialist: await upsertRef("role", "role-marketing-specialist", "Marketing Specialist"),
    hrbp: await upsertRef("role", "role-hrbp", "HR Business Partner"),
    financialAnalyst: await upsertRef("role", "role-financial-analyst", "Financial Analyst"),
  };

  type EmployeeSeed = {
    id: string;
    name: string;
    dept: string;
    loc: string;
    role: string;
    managerId: string;
    hireDate: Date;
    probationEndDate?: Date | null;
    probationExceptionApproved?: boolean;
    lastTransferCompletedAt?: Date | null;
    isActive?: boolean;
    hasActiveDisciplinaryProcess?: boolean;
    disciplinaryOverrideApproved?: boolean;
  };

  const employees: EmployeeSeed[] = [
    // Managers / HR first so managerId references resolve.
    { id: "mgr-james", name: "James Whitfield", dept: departments.engineering.id, loc: locations.london.id, role: roles.engManager.id, managerId: "mgr-james", hireDate: monthsAgo(60) },
    { id: "hr-priya", name: "Priya Anand", dept: departments.hr.id, loc: locations.london.id, role: roles.hrbp.id, managerId: "mgr-james", hireDate: monthsAgo(48) },

    // Established employees, no complications - good for a clean demo happy path.
    { id: "emp-alice", name: "Alice Chen", dept: departments.engineering.id, loc: locations.london.id, role: roles.swe.id, managerId: "mgr-james", hireDate: monthsAgo(30) },
    { id: "emp-ben", name: "Ben Okafor", dept: departments.engineering.id, loc: locations.manchester.id, role: roles.seniorSwe.id, managerId: "mgr-james", hireDate: monthsAgo(40) },
    { id: "emp-clara", name: "Clara Dubois", dept: departments.sales.id, loc: locations.london.id, role: roles.salesExec.id, managerId: "mgr-james", hireDate: monthsAgo(24) },

    // Eligibility edge cases, so the app actually demonstrates the business rules.
    { id: "emp-dev-new", name: "Devon Marsh", dept: departments.marketing.id, loc: locations.birmingham.id, role: roles.marketingSpecialist.id, managerId: "mgr-james", hireDate: monthsAgo(4) }, // < 12mo tenure -> NOT_ELIGIBLE
    { id: "emp-elena-probation", name: "Elena Petrov", dept: departments.finance.id, loc: locations.edinburgh.id, role: roles.financialAnalyst.id, managerId: "mgr-james", hireDate: monthsAgo(3), probationEndDate: daysFromNow(30), probationExceptionApproved: false }, // on probation, no exception
    { id: "emp-farid-exception", name: "Farid Hussain", dept: departments.engineering.id, loc: locations.london.id, role: roles.swe.id, managerId: "mgr-james", hireDate: monthsAgo(24), probationEndDate: daysFromNow(20), probationExceptionApproved: true }, // on probation WITH exception - eligible
    { id: "emp-grace-cooldown", name: "Grace Kim", dept: departments.sales.id, loc: locations.london.id, role: roles.salesExec.id, managerId: "mgr-james", hireDate: monthsAgo(36), lastTransferCompletedAt: monthsAgo(4) }, // cooling-off active
    { id: "emp-henry-notice", name: "Henry Osei", dept: departments.finance.id, loc: locations.london.id, role: roles.financialAnalyst.id, managerId: "mgr-james", hireDate: monthsAgo(30), isActive: false }, // serving notice -> NOT_ELIGIBLE (BR-01/AC32)
    { id: "emp-isla-disciplinary", name: "Isla Fraser", dept: departments.marketing.id, loc: locations.manchester.id, role: roles.marketingSpecialist.id, managerId: "mgr-james", hireDate: monthsAgo(30), hasActiveDisciplinaryProcess: true, disciplinaryOverrideApproved: false }, // active disciplinary process, no HR override -> NOT_ELIGIBLE (BR-04/AC33)
  ];

  for (const e of employees) {
    await prisma.employeeProfileSeed.upsert({
      where: { employeeId: e.id },
      create: {
        employeeId: e.id,
        name: e.name,
        currentDepartmentId: e.dept,
        currentLocationId: e.loc,
        currentRoleId: e.role,
        managerId: e.managerId,
        hireDate: e.hireDate,
        probationEndDate: e.probationEndDate ?? null,
        probationExceptionApproved: e.probationExceptionApproved ?? false,
        lastTransferCompletedAt: e.lastTransferCompletedAt ?? null,
        isActive: e.isActive ?? true,
        hasActiveDisciplinaryProcess: e.hasActiveDisciplinaryProcess ?? false,
        disciplinaryOverrideApproved: e.disciplinaryOverrideApproved ?? false,
      },
      update: {
        name: e.name,
        currentDepartmentId: e.dept,
        currentLocationId: e.loc,
        currentRoleId: e.role,
        managerId: e.managerId,
        hireDate: e.hireDate,
        probationEndDate: e.probationEndDate ?? null,
        probationExceptionApproved: e.probationExceptionApproved ?? false,
        lastTransferCompletedAt: e.lastTransferCompletedAt ?? null,
        isActive: e.isActive ?? true,
        hasActiveDisciplinaryProcess: e.hasActiveDisciplinaryProcess ?? false,
        disciplinaryOverrideApproved: e.disciplinaryOverrideApproved ?? false,
      },
    });
  }

  // --- Sample transfer requests across the lifecycle, so the queues/list aren't empty ---
  await prisma.auditEvent.deleteMany({ where: { requestId: { startsWith: "seed-" } } });
  await prisma.fulfilmentTask.deleteMany({ where: { requestId: { startsWith: "seed-" } } });
  await prisma.hrDecision.deleteMany({ where: { requestId: { startsWith: "seed-" } } });
  await prisma.managerDecision.deleteMany({ where: { requestId: { startsWith: "seed-" } } });
  await prisma.transferRequest.deleteMany({ where: { id: { startsWith: "seed-" } } });

  // 1) Awaiting Alice's manager (James) - shows up in James's Approvals queue.
  await prisma.transferRequest.create({
    data: {
      id: "seed-req-alice-submitted",
      employeeId: "emp-alice",
      currentDepartmentId: departments.engineering.id,
      currentLocationId: locations.london.id,
      currentRoleId: roles.swe.id,
      proposedDepartmentId: departments.engineering.id,
      proposedLocationId: locations.manchester.id,
      proposedRoleId: roles.seniorSwe.id,
      effectiveDate: daysFromNow(60),
      reason: "Relocating closer to family",
      status: "SUBMITTED",
      submittedAt: new Date(),
      assignedManagerId: "mgr-james",
    },
  });

  // 2) Manager confirmed, awaiting HR - shows up in HR Review queue.
  await prisma.transferRequest.create({
    data: {
      id: "seed-req-ben-hr-review",
      employeeId: "emp-ben",
      currentDepartmentId: departments.engineering.id,
      currentLocationId: locations.manchester.id,
      currentRoleId: roles.seniorSwe.id,
      proposedDepartmentId: departments.sales.id,
      proposedLocationId: locations.manchester.id,
      proposedRoleId: roles.salesExec.id,
      effectiveDate: daysFromNow(50),
      reason: "Career change into sales",
      status: "UNDER_HR_REVIEW",
      submittedAt: monthsAgo(0),
      assignedManagerId: "mgr-james",
    },
  });
  await prisma.managerDecision.create({
    data: { requestId: "seed-req-ben-hr-review", managerRole: "CURRENT", managerId: "mgr-james", decision: "CONFIRM" },
  });

  // 3) Approved, in progress with a mix of fulfilment task states.
  await prisma.transferRequest.create({
    data: {
      id: "seed-req-clara-in-progress",
      employeeId: "emp-clara",
      currentDepartmentId: departments.sales.id,
      currentLocationId: locations.london.id,
      currentRoleId: roles.salesExec.id,
      proposedDepartmentId: departments.marketing.id,
      proposedLocationId: locations.birmingham.id,
      proposedRoleId: roles.marketingSpecialist.id,
      effectiveDate: daysFromNow(40),
      reason: null,
      status: "APPROVED_IN_PROGRESS",
      submittedAt: monthsAgo(1),
      assignedManagerId: "mgr-james",
    },
  });
  await prisma.managerDecision.create({
    data: { requestId: "seed-req-clara-in-progress", managerRole: "CURRENT", managerId: "mgr-james", decision: "CONFIRM" },
  });
  await prisma.hrDecision.create({ data: { requestId: "seed-req-clara-in-progress", decision: "ELIGIBLE" } });
  await prisma.fulfilmentTask.createMany({
    data: [
      { requestId: "seed-req-clara-in-progress", taskType: "PAYROLL", status: "COMPLETE" },
      { requestId: "seed-req-clara-in-progress", taskType: "IT", status: "IN_PROGRESS" },
      { requestId: "seed-req-clara-in-progress", taskType: "FACILITIES", status: "IN_PROGRESS" },
    ],
  });

  // 4) Completed - shows the full happy-path end state.
  await prisma.transferRequest.create({
    data: {
      id: "seed-req-farid-completed",
      employeeId: "emp-farid-exception",
      currentDepartmentId: departments.engineering.id,
      currentLocationId: locations.london.id,
      currentRoleId: roles.swe.id,
      proposedDepartmentId: departments.engineering.id,
      proposedLocationId: locations.london.id,
      proposedRoleId: roles.seniorSwe.id,
      effectiveDate: monthsAgo(-1),
      reason: "Promotion-linked move",
      status: "COMPLETED",
      submittedAt: monthsAgo(3),
      assignedManagerId: "mgr-james",
    },
  });
  await prisma.managerDecision.create({
    data: { requestId: "seed-req-farid-completed", managerRole: "CURRENT", managerId: "mgr-james", decision: "CONFIRM" },
  });
  await prisma.hrDecision.create({ data: { requestId: "seed-req-farid-completed", decision: "ELIGIBLE" } });
  await prisma.fulfilmentTask.createMany({
    data: [{ requestId: "seed-req-farid-completed", taskType: "PAYROLL", status: "COMPLETE" }],
  });

  // 5) Rejected by HR - shows the rejection path with a reason.
  await prisma.transferRequest.create({
    data: {
      id: "seed-req-grace-rejected",
      employeeId: "emp-grace-cooldown",
      currentDepartmentId: departments.sales.id,
      currentLocationId: locations.london.id,
      currentRoleId: roles.salesExec.id,
      proposedDepartmentId: departments.marketing.id,
      proposedLocationId: locations.london.id,
      proposedRoleId: roles.marketingSpecialist.id,
      effectiveDate: monthsAgo(-2),
      reason: null,
      status: "REJECTED",
      submittedAt: monthsAgo(5),
      assignedManagerId: "mgr-james",
    },
  });
  await prisma.managerDecision.create({
    data: { requestId: "seed-req-grace-rejected", managerRole: "CURRENT", managerId: "mgr-james", decision: "CONFIRM" },
  });
  await prisma.hrDecision.create({
    data: { requestId: "seed-req-grace-rejected", decision: "NOT_ELIGIBLE", reason: "Within the 12-month post-transfer cooling-off period" },
  });

  console.log("Seed complete:");
  console.log(`  ${Object.keys(departments).length} departments, ${Object.keys(locations).length} locations, ${Object.keys(roles).length} roles`);
  console.log(`  ${employees.length} employees (try: mgr-james, hr-priya, emp-alice, emp-ben, emp-clara, emp-dev-new, emp-elena-probation, emp-farid-exception, emp-grace-cooldown, emp-henry-notice, emp-isla-disciplinary)`);
  console.log("  5 sample transfer requests across Submitted/Under HR Review/Approved-In-Progress/Completed/Rejected");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
