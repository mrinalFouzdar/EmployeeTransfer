-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'MANAGER_CONFIRMED', 'RETURNED_FOR_AMENDMENT', 'UNDER_HR_REVIEW', 'APPROVED_IN_PROGRESS', 'PENDING_ACTION', 'ON_HOLD', 'COMPLETED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ManagerRole" AS ENUM ('CURRENT', 'RECEIVING');

-- CreateEnum
CREATE TYPE "ManagerDecisionType" AS ENUM ('CONFIRM', 'DECLINE', 'RETURN');

-- CreateEnum
CREATE TYPE "HrDecisionType" AS ENUM ('ELIGIBLE', 'NOT_ELIGIBLE', 'ELIGIBLE_WITH_CONDITIONS');

-- CreateEnum
CREATE TYPE "FulfilmentTaskType" AS ENUM ('PAYROLL', 'IT', 'FACILITIES');

-- CreateEnum
CREATE TYPE "FulfilmentTaskStatus" AS ENUM ('NOT_APPLICABLE', 'IN_PROGRESS', 'COMPLETE', 'FAILED');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "currentDepartmentId" TEXT NOT NULL,
    "currentLocationId" TEXT NOT NULL,
    "currentRoleId" TEXT NOT NULL,
    "proposedDepartmentId" TEXT NOT NULL,
    "proposedLocationId" TEXT NOT NULL,
    "proposedRoleId" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerDecision" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "managerRole" "ManagerRole" NOT NULL,
    "managerId" TEXT NOT NULL,
    "decision" "ManagerDecisionType" NOT NULL,
    "reason" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagerDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrDecision" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "decision" "HrDecisionType" NOT NULL,
    "reason" TEXT,
    "conditions" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfilmentTask" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "taskType" "FulfilmentTaskType" NOT NULL,
    "status" "FulfilmentTaskStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FulfilmentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "decision" TEXT,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "TransferRequest_employeeId_idx" ON "TransferRequest"("employeeId");

-- CreateIndex
CREATE INDEX "ManagerDecision_requestId_idx" ON "ManagerDecision"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "HrDecision_requestId_key" ON "HrDecision"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "FulfilmentTask_requestId_taskType_key" ON "FulfilmentTask"("requestId", "taskType");

-- CreateIndex
CREATE INDEX "AuditEvent_requestId_idx" ON "AuditEvent"("requestId");

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_currentDepartmentId_fkey" FOREIGN KEY ("currentDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_currentRoleId_fkey" FOREIGN KEY ("currentRoleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_proposedDepartmentId_fkey" FOREIGN KEY ("proposedDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_proposedLocationId_fkey" FOREIGN KEY ("proposedLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_proposedRoleId_fkey" FOREIGN KEY ("proposedRoleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagerDecision" ADD CONSTRAINT "ManagerDecision_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransferRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrDecision" ADD CONSTRAINT "HrDecision_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransferRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FulfilmentTask" ADD CONSTRAINT "FulfilmentTask_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransferRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransferRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
