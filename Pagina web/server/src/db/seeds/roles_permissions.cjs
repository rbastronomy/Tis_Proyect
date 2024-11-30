   // Pagina web/server/src/db/seeds/roles_permissions.cjs
   exports.seed = async function(knex) {
    // Clean the tables first
    await knex('posee').del();
    await knex('permiso').del();
    await knex('roles').del();

    // Insert roles
    await knex('roles').insert([
      { 
        idroles: 1,
        nombrerol: 'ADMIN',
        descripcionrol: 'Administrador con acceso completo',
        fechacreadarol: new Date(),
        estadorol: 'ACTIVO'
      },
      { 
        idroles: 2,
        nombrerol: 'USER',
        descripcionrol: 'Usuario con acceso limitado',
        fechacreadarol: new Date(),
        estadorol: 'ACTIVO'
      },
      { 
        idroles: 3,
        nombrerol: 'CONDUCTOR',
        descripcionrol: 'Conductor con acceso a viajes',
        fechacreadarol: new Date(),
        estadorol: 'ACTIVO'
      }
    ]);

    // Insert permissions
    await knex('permiso').insert([
      {
        idpermisos: 1,
        nombrepermiso: 'crear_usuario',
        descripcionpermiso: 'Permiso para crear usuarios',
        fechacreacion: new Date()
      },
      {
        idpermisos: 2,
        nombrepermiso: 'eliminar_usuario',
        descripcionpermiso: 'Permiso para eliminar usuarios',
        fechacreacion: new Date()
      },
      {
        idpermisos: 3,
        nombrepermiso: 'asignar_rol',
        descripcionpermiso: 'Permiso para asignar roles',
        fechacreacion: new Date()
      },
      {
        idpermisos: 4,
        nombrepermiso: 'gestionar_viajes',
        descripcionpermiso: 'Permiso para gestionar viajes',
        fechacreacion: new Date()
      }
    ]);

    // Assign permissions to roles through 'posee' table
    const rolePermissions = [
      // Admin has all permissions
      { 
        idroles: 1, 
        idpermisos: 1,
        fcambio: new Date()
      },
      { 
        idroles: 1, 
        idpermisos: 2,
        fcambio: new Date()
      },
      { 
        idroles: 1, 
        idpermisos: 3,
        fcambio: new Date()
      },
      { 
        idroles: 1, 
        idpermisos: 4,
        fcambio: new Date()
      },
      
      // User has limited permissions
      { 
        idroles: 2, 
        idpermisos: 4,
        fcambio: new Date()
      },
      
      // Driver has trip management permissions
      { 
        idroles: 3, 
        idpermisos: 4,
        fcambio: new Date()
      }
    ];

    await knex('posee').insert(rolePermissions);
  };