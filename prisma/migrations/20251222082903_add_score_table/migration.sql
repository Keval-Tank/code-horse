-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_repositoryId_fkey";

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "repoId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Score_repoId_key" ON "Score"("repoId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
