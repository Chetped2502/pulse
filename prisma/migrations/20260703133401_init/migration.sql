-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "tiktokOpenId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "refreshTokenEncrypted" TEXT NOT NULL,
    "accessTokenExpiresAt" DATETIME NOT NULL,
    "refreshTokenExpiresAt" DATETIME NOT NULL,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AccountSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" INTEGER NOT NULL,
    "capturedAt" DATETIME NOT NULL,
    "followerCount" INTEGER,
    "followingCount" INTEGER,
    "totalLikeCount" INTEGER,
    "videoCount" INTEGER,
    CONSTRAINT "AccountSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "shareUrl" TEXT NOT NULL,
    "embedLink" TEXT NOT NULL,
    "postedAt" DATETIME NOT NULL,
    "bookmarkedAt" DATETIME,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" DATETIME NOT NULL,
    CONSTRAINT "Video_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "videoId" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "likeCount" INTEGER NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "shareCount" INTEGER NOT NULL,
    CONSTRAINT "VideoSnapshot_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL,
    "videosSynced" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_tiktokOpenId_key" ON "Account"("tiktokOpenId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountSnapshot_accountId_capturedAt_key" ON "AccountSnapshot"("accountId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSnapshot_videoId_capturedAt_key" ON "VideoSnapshot"("videoId", "capturedAt");
