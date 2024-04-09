-- CreateTable
CREATE TABLE "TimedOut" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "time" BIGINT NOT NULL,

    CONSTRAINT "TimedOut_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimedOut" ADD CONSTRAINT "TimedOut_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimedOut" ADD CONSTRAINT "TimedOut_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groupe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
