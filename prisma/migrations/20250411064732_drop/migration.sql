/*
  Warnings:

  - You are about to drop the column `user_id` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_user_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_id";
