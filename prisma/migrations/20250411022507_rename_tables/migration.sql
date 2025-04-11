/*
  Warnings:

  - You are about to drop the `Guess` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Guess" DROP CONSTRAINT "Guess_userId_fkey";

-- DropTable
DROP TABLE "Guess";

-- DropTable
DROP TABLE "Price";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clerk_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "guessesMade" INTEGER NOT NULL DEFAULT 0,
    "guessesLost" INTEGER NOT NULL DEFAULT 0,
    "guessesPending" INTEGER NOT NULL DEFAULT 0,
    "activeGuess" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guesses" (
    "guessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "startPrice" DOUBLE PRECISION NOT NULL,
    "endPrice" DOUBLE PRECISION,
    "guessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "result" "Result",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guesses_pkey" PRIMARY KEY ("guessId")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_clerk_id_idx" ON "users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "guesses_userId_idx" ON "guesses"("userId");

-- CreateIndex
CREATE INDEX "guesses_isActive_idx" ON "guesses"("isActive");

-- CreateIndex
CREATE INDEX "prices_timestamp_idx" ON "prices"("timestamp");

-- AddForeignKey
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
