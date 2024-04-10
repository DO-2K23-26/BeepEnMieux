-- DropIndex
DROP INDEX "User_socketId_key";

-- AlterTable
ALTER TABLE "TimedOut" ALTER COLUMN "time" SET DATA TYPE TEXT;
