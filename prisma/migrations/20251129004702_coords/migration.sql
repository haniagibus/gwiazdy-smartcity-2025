/*
  Warnings:

  - You are about to drop the column `id_object` on the `Report` table. All the data in the column will be lost.
  - Added the required column `x_coord` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y_coord` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "x_coord" REAL NOT NULL,
    "y_coord" REAL NOT NULL,
    "name" TEXT NOT NULL,
    "added_date" DATETIME NOT NULL
);
INSERT INTO "new_Report" ("added_date", "id", "name") SELECT "added_date", "id", "name" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
