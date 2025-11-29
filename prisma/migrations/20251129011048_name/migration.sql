/*
  Warnings:

  - Added the required column `desc` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "x_coord" REAL NOT NULL,
    "y_coord" REAL NOT NULL,
    "desc" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "added_date" DATETIME NOT NULL
);
INSERT INTO "new_Report" ("added_date", "id", "name", "x_coord", "y_coord") SELECT "added_date", "id", "name", "x_coord", "y_coord" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
