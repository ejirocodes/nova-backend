-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('up', 'down');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('correct', 'incorrect');

-- CreateTable
CREATE TABLE "User" (
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

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guess" (
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

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("guessId")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerk_id_key" ON "User"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerk_id_idx" ON "User"("clerk_id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Guess_userId_idx" ON "Guess"("userId");

-- CreateIndex
CREATE INDEX "Guess_isActive_idx" ON "Guess"("isActive");

-- CreateIndex
CREATE INDEX "Price_timestamp_idx" ON "Price"("timestamp");

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
