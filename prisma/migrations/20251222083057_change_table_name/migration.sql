/*
  Warnings:

  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_repoId_fkey";

-- DropTable
DROP TABLE "Score";

-- CreateTable
CREATE TABLE "score" (
    "id" SERIAL NOT NULL,
    "repoId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "score_repoId_key" ON "score"("repoId");

-- AddForeignKey
ALTER TABLE "score" ADD CONSTRAINT "score_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
