   // Pagina web/server/src/db/seeds/initial_roles_permissions.cjs
   exports.seed = async function(knex) {
    // Inserts seed entries for roles
    await knex('roles').insert([
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Regular user with limited access' },
    ]);

    // Inserts seed entries for permissions
    await knex('permissions').insert([
      { name: 'create_user', description: 'Permission to create users' },
      { name: 'delete_user', description: 'Permission to delete users' },
      { name: 'assign_role', description: 'Permission to assign roles' },
      // Add more permissions as needed
    ]);

    // Assign permissions to roles
    const adminRole = await knex('roles').where({ name: 'admin' }).first();
    const userRole = await knex('roles').where({ name: 'cliente' }).first();

    const permissions = await knex('permissions').select('id');

    // Admin has all permissions
    for (const permission of permissions) {
      await knex('role_permissions').insert({ role_id: adminRole.id, permission_id: permission.id });
    }

    // User role can have specific permissions if needed
    // Example: Users can create content but not manage users
  };