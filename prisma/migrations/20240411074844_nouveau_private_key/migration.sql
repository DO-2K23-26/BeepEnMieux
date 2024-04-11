/*
  Warnings:

  - The primary key for the `TimedOut` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TimedOut` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TimedOut" DROP CONSTRAINT "TimedOut_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "TimedOut_pkey" PRIMARY KEY ("userId", "groupId");
