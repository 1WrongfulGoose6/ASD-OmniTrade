-- CreateTable
CREATE TABLE "TradeBacklog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "asset" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradeBacklog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TradeBacklog_userId_idx" ON "TradeBacklog"("userId");

-- CreateIndex
CREATE INDEX "TradeBacklog_type_idx" ON "TradeBacklog"("type");
