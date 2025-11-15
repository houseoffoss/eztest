import { prisma } from '../lib/prisma';

async function seedAuthorizationSystem() {
  console.log('Seeding authorization system...');

  // Create Actions (CRUD operations)
  const actions = await Promise.all([
    prisma.action.upsert({
      where: { keyword: 'r' },
      update: {},
      create: {
        name: 'Read',
        keyword: 'r',
        score: 1
      }
    }),
    prisma.action.upsert({
      where: { keyword: 'w' },
      update: {},
      create: {
        name: 'Write',
        keyword: 'w',
        score: 2
      }
    }),
    prisma.action.upsert({
      where: { keyword: 'u' },
      update: {},
      create: {
        name: 'Update',
        keyword: 'u',
        score: 3
      }
    }),
    prisma.action.upsert({
      where: { keyword: 'd' },
      update: {},
      create: {
        name: 'Delete',
        keyword: 'd',
        score: 4
      }
    })
  ]);

  // Create Scopes
  const scopes = await Promise.all([
    prisma.scope.upsert({
      where: { keyword: 'all' },
      update: {},
      create: {
        name: 'All',
        keyword: 'all',
        score: 1
      }
    }),
    prisma.scope.upsert({
      where: { keyword: 'project' },
      update: {},
      create: {
        name: 'Project',
        keyword: 'project',
        score: 2
      }
    }),
    prisma.scope.upsert({
      where: { keyword: 'own' },
      update: {},
      create: {
        name: 'Own',
        keyword: 'own',
        score: 3
      }
    })
  ]);

  // Create Modules
  const modules = await Promise.all([
    prisma.module.upsert({
      where: { keyword: 'prn' },
      update: {},
      create: {
        name: 'Projects',
        keyword: 'prn'
      }
    }),
    prisma.module.upsert({
      where: { keyword: 'tc' },
      update: {},
      create: {
        name: 'Test Cases',
        keyword: 'tc'
      }
    }),
    prisma.module.upsert({
      where: { keyword: 'tr' },
      update: {},
      create: {
        name: 'Test Runs',
        keyword: 'tr'
      }
    }),
    prisma.module.upsert({
      where: { keyword: 'usr' },
      update: {},
      create: {
        name: 'Users',
        keyword: 'usr'
      }
    })
  ]);

  // Create Roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { keyword: 'admin' },
      update: {},
      create: {
        name: 'Admin',
        keyword: 'admin'
      }
    }),
    prisma.role.upsert({
      where: { keyword: 'project_manager' },
      update: {},
      create: {
        name: 'Project Manager',
        keyword: 'project_manager'
      }
    }),
    prisma.role.upsert({
      where: { keyword: 'tester' },
      update: {},
      create: {
        name: 'Tester',
        keyword: 'tester'
      }
    }),
    prisma.role.upsert({
      where: { keyword: 'viewer' },
      update: {},
      create: {
        name: 'Viewer',
        keyword: 'viewer'
      }
    })
  ]);

  // Create Role Privileges for Admin (full access to everything)
  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'admin',
        module_keyword: 'prn',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'admin',
      module_keyword: 'prn',
      action_keyword: 'd', // Delete (highest permission)
      scope_keyword: 'all'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'admin',
        module_keyword: 'tc',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'admin',
      module_keyword: 'tc',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'admin',
        module_keyword: 'tr',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'admin',
      module_keyword: 'tr',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'admin',
        module_keyword: 'usr',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'admin',
      module_keyword: 'usr',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  // Create Role Privileges for Project Manager
  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'project_manager',
        module_keyword: 'prn',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'project_manager',
      module_keyword: 'prn',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'project_manager',
        module_keyword: 'tc',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'project_manager',
      module_keyword: 'tc',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'project_manager',
        module_keyword: 'tr',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'project_manager',
      module_keyword: 'tr',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  // Create Role Privileges for Tester
  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'tester',
        module_keyword: 'prn',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'tester',
      module_keyword: 'prn',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'tester',
        module_keyword: 'tc',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'tester',
      module_keyword: 'tc',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'tester',
        module_keyword: 'tr',
        action_keyword: 'd'
      }
    },
    update: {},
    create: {
      role_name: 'tester',
      module_keyword: 'tr',
      action_keyword: 'd',
      scope_keyword: 'all'
    }
  });

  // Create Role Privileges for Viewer (read-only)
  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'viewer',
        module_keyword: 'prn',
        action_keyword: 'r'
      }
    },
    update: {},
    create: {
      role_name: 'viewer',
      module_keyword: 'prn',
      action_keyword: 'r',
      scope_keyword: 'project'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'viewer',
        module_keyword: 'tc',
        action_keyword: 'r'
      }
    },
    update: {},
    create: {
      role_name: 'viewer',
      module_keyword: 'tc',
      action_keyword: 'r',
      scope_keyword: 'project'
    }
  });

  await prisma.rolePrivilege.upsert({
    where: {
      role_name_module_keyword_action_keyword: {
        role_name: 'viewer',
        module_keyword: 'tr',
        action_keyword: 'r'
      }
    },
    update: {},
    create: {
      role_name: 'viewer',
      module_keyword: 'tr',
      action_keyword: 'r',
      scope_keyword: 'project'
    }
  });

  console.log('Authorization system seeded successfully!');
}

export { seedAuthorizationSystem };
