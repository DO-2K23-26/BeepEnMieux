/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `Groupe` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[socketId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Groupe_nom_key" ON "Groupe"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "User_socketId_key" ON "User"("socketId");
