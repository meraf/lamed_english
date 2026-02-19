/*
  Warnings:

  - You are about to drop the column `answers` on the `ExamResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "ExamResult" DROP COLUMN "answers",
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "textAnswer" TEXT;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "isCompleted" SET DEFAULT false;
