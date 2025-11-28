/*
  Warnings:

  - Added the required column `desc` to the `Opinion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Opinion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_object" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "added_date" DATETIME NOT NULL
);
INSERT INTO "new_Opinion" ("added_date", "id", "id_object", "name", "rating") SELECT "added_date", "id", "id_object", "name", "rating" FROM "Opinion";
DROP TABLE "Opinion";
ALTER TABLE "new_Opinion" RENAME TO "Opinion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
