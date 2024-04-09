/*
  Warnings:

  - You are about to drop the `_GroupeToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `Groupe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_GroupeToUser" DROP CONSTRAINT "_GroupeToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupeToUser" DROP CONSTRAINT "_GroupeToUser_B_fkey";

-- AlterTable
ALTER TABLE "Groupe" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_GroupeToUser";

-- CreateTable
CREATE TABLE "_usersGroupe" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_superUsersGroupe" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_usersGroupe_AB_unique" ON "_usersGroupe"("A", "B");

-- CreateIndex
CREATE INDEX "_usersGroupe_B_index" ON "_usersGroupe"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_superUsersGroupe_AB_unique" ON "_superUsersGroupe"("A", "B");

-- CreateIndex
CREATE INDEX "_superUsersGroupe_B_index" ON "_superUsersGroupe"("B");

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_usersGroupe" ADD CONSTRAINT "_usersGroupe_A_fkey" FOREIGN KEY ("A") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_usersGroupe" ADD CONSTRAINT "_usersGroupe_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_superUsersGroupe" ADD CONSTRAINT "_superUsersGroupe_A_fkey" FOREIGN KEY ("A") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_superUsersGroupe" ADD CONSTRAINT "_superUsersGroupe_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
