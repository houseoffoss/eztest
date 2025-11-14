-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePrivilege" (
    "id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "module_keyword" TEXT NOT NULL,
    "action_keyword" TEXT NOT NULL,
    "scope_keyword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePrivilege_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_keyword_key" ON "Role"("keyword");

-- CreateIndex
CREATE INDEX "Role_keyword_idx" ON "Role"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "Module_keyword_key" ON "Module"("keyword");

-- CreateIndex
CREATE INDEX "Module_keyword_idx" ON "Module"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "Action_keyword_key" ON "Action"("keyword");

-- CreateIndex
CREATE INDEX "Action_keyword_idx" ON "Action"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "Scope_keyword_key" ON "Scope"("keyword");

-- CreateIndex
CREATE INDEX "Scope_keyword_idx" ON "Scope"("keyword");

-- CreateIndex
CREATE INDEX "RolePrivilege_role_name_idx" ON "RolePrivilege"("role_name");

-- CreateIndex
CREATE INDEX "RolePrivilege_module_keyword_idx" ON "RolePrivilege"("module_keyword");

-- CreateIndex
CREATE UNIQUE INDEX "RolePrivilege_role_name_module_keyword_action_keyword_key" ON "RolePrivilege"("role_name", "module_keyword", "action_keyword");

-- AddForeignKey
ALTER TABLE "RolePrivilege" ADD CONSTRAINT "RolePrivilege_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "Role"("keyword") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePrivilege" ADD CONSTRAINT "RolePrivilege_module_keyword_fkey" FOREIGN KEY ("module_keyword") REFERENCES "Module"("keyword") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePrivilege" ADD CONSTRAINT "RolePrivilege_action_keyword_fkey" FOREIGN KEY ("action_keyword") REFERENCES "Action"("keyword") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePrivilege" ADD CONSTRAINT "RolePrivilege_scope_keyword_fkey" FOREIGN KEY ("scope_keyword") REFERENCES "Scope"("keyword") ON DELETE CASCADE ON UPDATE CASCADE;
