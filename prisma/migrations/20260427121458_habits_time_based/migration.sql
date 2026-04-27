-- CreateEnum
CREATE TYPE "HabitKind" AS ENUM ('COUNT', 'TIME');

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "kind" "HabitKind" NOT NULL DEFAULT 'COUNT',
ADD COLUMN     "targetMinutes" INTEGER;

-- AlterTable
ALTER TABLE "HabitLog" ADD COLUMN     "minutes" INTEGER;

-- AlterTable
ALTER TABLE "PomodoroSession" ADD COLUMN     "habitId" TEXT;

-- CreateIndex
CREATE INDEX "PomodoroSession_habitId_idx" ON "PomodoroSession"("habitId");

-- AddForeignKey
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
