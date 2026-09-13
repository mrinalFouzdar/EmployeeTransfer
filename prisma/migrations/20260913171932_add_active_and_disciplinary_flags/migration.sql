-- AlterTable
ALTER TABLE "EmployeeProfileSeed" ADD COLUMN     "disciplinaryOverrideApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasActiveDisciplinaryProcess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
