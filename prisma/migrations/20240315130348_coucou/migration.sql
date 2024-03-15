/*
  Warnings:

  - Added the required column `timestamp` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Made the column `authorId` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `groupeId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupeId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "timestamp" INTEGER NOT NULL,
ALTER COLUMN "authorId" SET NOT NULL,
ALTER COLUMN "groupeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
