-- CreateTable
CREATE TABLE "EmployeeProfileSeed" (
    "employeeId" TEXT NOT NULL,
    "currentDepartmentId" TEXT NOT NULL,
    "currentLocationId" TEXT NOT NULL,
    "currentRoleId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "probationEndDate" TIMESTAMP(3),
    "probationExceptionApproved" BOOLEAN NOT NULL DEFAULT false,
    "lastTransferCompletedAt" TIMESTAMP(3),

    CONSTRAINT "EmployeeProfileSeed_pkey" PRIMARY KEY ("employeeId")
);

-- AddForeignKey
ALTER TABLE "EmployeeProfileSeed" ADD CONSTRAINT "EmployeeProfileSeed_currentDepartmentId_fkey" FOREIGN KEY ("currentDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfileSeed" ADD CONSTRAINT "EmployeeProfileSeed_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfileSeed" ADD CONSTRAINT "EmployeeProfileSeed_currentRoleId_fkey" FOREIGN KEY ("currentRoleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
