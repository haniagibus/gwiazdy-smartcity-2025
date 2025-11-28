-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_object" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "added_date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Opinion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_object" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "added_date" DATETIME NOT NULL
);
