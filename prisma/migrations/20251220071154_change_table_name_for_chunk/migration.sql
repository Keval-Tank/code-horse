/*
  Warnings:

  - You are about to drop the `Chunks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Chunks";

-- CreateTable
CREATE TABLE "chunks" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "chunks_pkey" PRIMARY KEY ("id")
);
