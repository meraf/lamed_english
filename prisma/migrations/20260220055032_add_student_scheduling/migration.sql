/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `audioUrl` on the `ExamResult` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `expertise` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnnouncementView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaterialProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_courseId_fkey";

-- DropForeignKey
ALTER TABLE "AnnouncementView" DROP CONSTRAINT "AnnouncementView_announcementId_fkey";

-- DropForeignKey
ALTER TABLE "AnnouncementView" DROP CONSTRAINT "AnnouncementView_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExamResult" DROP CONSTRAINT "ExamResult_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamResult" DROP CONSTRAINT "ExamResult_userId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialProgress" DROP CONSTRAINT "MaterialProgress_materialId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialProgress" DROP CONSTRAINT "MaterialProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_userId_fkey";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "fileUrl";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "price",
DROP COLUMN "thumbnail";

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "googleMeetLink" TEXT;

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "description",
DROP COLUMN "fileUrl";

-- AlterTable
ALTER TABLE "ExamResult" DROP COLUMN "audioUrl";

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "fileType";

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "score" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "expertise",
DROP COLUMN "rating",
DROP COLUMN "role",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "createdAt",
DROP COLUMN "isCompleted",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Announcement";

-- DropTable
DROP TABLE "AnnouncementView";

-- DropTable
DROP TABLE "MaterialProgress";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
