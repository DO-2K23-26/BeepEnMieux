/*
  Warnings:

  - You are about to drop the column `groupeId` on the `Message` table. All the data in the column will be lost.
  - The `timestamp` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TimedOut` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `groupId` on the `TimedOut` table. All the data in the column will be lost.
  - You are about to drop the `Groupe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_superUsersGroupe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_usersGroupe` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `channelId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channelId` to the `TimedOut` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Groupe" DROP CONSTRAINT "Groupe_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupeId_fkey";

-- DropForeignKey
ALTER TABLE "TimedOut" DROP CONSTRAINT "TimedOut_groupId_fkey";

-- DropForeignKey
ALTER TABLE "_superUsersGroupe" DROP CONSTRAINT "_superUsersGroupe_A_fkey";

-- DropForeignKey
ALTER TABLE "_superUsersGroupe" DROP CONSTRAINT "_superUsersGroupe_B_fkey";

-- DropForeignKey
ALTER TABLE "_usersGroupe" DROP CONSTRAINT "_usersGroupe_A_fkey";

-- DropForeignKey
ALTER TABLE "_usersGroupe" DROP CONSTRAINT "_usersGroupe_B_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "groupeId",
ADD COLUMN     "channelId" INTEGER NOT NULL,
DROP COLUMN "timestamp",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TimedOut" DROP CONSTRAINT "TimedOut_pkey",
DROP COLUMN "groupId",
ADD COLUMN     "channelId" INTEGER NOT NULL,
ADD CONSTRAINT "TimedOut_pkey" PRIMARY KEY ("userId", "channelId");

-- DropTable
DROP TABLE "Groupe";

-- DropTable
DROP TABLE "_superUsersGroupe";

-- DropTable
DROP TABLE "_usersGroupe";

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "serverId" INTEGER NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banned" (
    "userId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "time" TEXT NOT NULL,

    CONSTRAINT "Banned_pkey" PRIMARY KEY ("userId","serverId")
);

-- CreateTable
CREATE TABLE "_usersServer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_nom_key" ON "Channel"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Server_nom_key" ON "Server"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "_usersServer_AB_unique" ON "_usersServer"("A", "B");

-- CreateIndex
CREATE INDEX "_usersServer_B_index" ON "_usersServer"("B");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimedOut" ADD CONSTRAINT "TimedOut_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banned" ADD CONSTRAINT "Banned_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banned" ADD CONSTRAINT "Banned_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_usersServer" ADD CONSTRAINT "_usersServer_A_fkey" FOREIGN KEY ("A") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_usersServer" ADD CONSTRAINT "_usersServer_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
