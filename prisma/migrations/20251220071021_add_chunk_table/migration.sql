-- CreateTable
CREATE TABLE "Chunks" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Chunks_pkey" PRIMARY KEY ("id")
);
