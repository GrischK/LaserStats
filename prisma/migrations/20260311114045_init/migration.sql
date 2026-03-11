-- CreateTable
CREATE TABLE "Runner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Runner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShotSession" (
    "id" TEXT NOT NULL,
    "runnerId" TEXT NOT NULL,
    "sessionDay" TIMESTAMP(3) NOT NULL,
    "distance" DOUBLE PRECISION,
    "targetsHit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShotSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShotSession_runnerId_sessionDay_idx" ON "ShotSession"("runnerId", "sessionDay");

-- AddForeignKey
ALTER TABLE "ShotSession" ADD CONSTRAINT "ShotSession_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
