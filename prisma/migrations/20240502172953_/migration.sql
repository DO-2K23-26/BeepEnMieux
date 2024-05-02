/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Channel_nom_key" ON "Channel"("nom");
