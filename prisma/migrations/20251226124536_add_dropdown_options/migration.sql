-- CreateTable
CREATE TABLE "DropdownOption" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DropdownOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DropdownOption_entity_field_idx" ON "DropdownOption"("entity", "field");

-- CreateIndex
CREATE INDEX "DropdownOption_isActive_idx" ON "DropdownOption"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DropdownOption_entity_field_value_key" ON "DropdownOption"("entity", "field", "value");

