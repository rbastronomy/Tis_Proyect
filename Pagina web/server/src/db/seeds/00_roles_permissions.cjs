   // Pagina web/server/src/db/seeds/roles_permissions.cjs
   exports.seed = async function(knex) {
    // Clean the tables first
    await knex('posee').del();
    await knex('permiso').del();
    await knex('roles').del();

    // Insert roles
    await knex('roles').insert([
      { 
        id_roles: 1,
        nombre_rol: 'ADMINISTRADOR',
        descripcion_rol: 'Administrador con acceso completo al sistema',
        fecha_creada_rol: new Date(),
        estado_rol: 'ACTIVO'
      },
      { 
        id_roles: 2,
        nombre_rol: 'USUARIO',
        descripcion_rol: 'Usuario regular del sistema',
        fecha_creada_rol: new Date(),
        estado_rol: 'ACTIVO'
      },
      { 
        id_roles: 3,
        nombre_rol: 'CONDUCTOR',
        descripcion_rol: 'Conductor de taxi con acceso a viajes',
        fecha_creada_rol: new Date(),
        estado_rol: 'ACTIVO'
      }
    ]);

    // Insert permissions
    await knex('permiso').insert([
      {
        id_permisos: 1,
        nombre_permiso: 'crear_usuario',
        descripcion_permiso: 'Crear nuevos usuarios en el sistema',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 2,
        nombre_permiso: 'eliminar_usuario',
        descripcion_permiso: 'Eliminar usuarios existentes',
        fechacreacion: new Date()
      },
      {
        id_permisos: 3,
        nombrepermiso: 'asignar_rol',
        descripcionpermiso: 'Asignar roles a usuarios',
        fechacreacion: new Date()
      },
      {
        id_permisos: 4,
        nombrepermiso: 'gestionar_viajes',
        descripcionpermiso: 'Gestionar viajes en el sistema',
        fechacreacion: new Date()
      },
      {
        id_permisos: 5,
        nombrepermiso: 'crear_reserva',
        descripcionpermiso: 'Crear nuevas reservas de taxi',
        fechacreacion: new Date()
      },
      {
        id_permisos: 6,
        nombrepermiso: 'cancelar_reserva',
        descripcionpermiso: 'Cancelar reservas existentes',
        fechacreacion: new Date()
      },
      {
        id_permisos: 7,
        nombrepermiso: 'ver_reservas',
        descripcionpermiso: 'Ver listado de reservas',
        fechacreacion: new Date()
      },
      {
        id_permisos: 8,
        nombrepermiso: 'validar_reserva',
        descripcionpermiso: 'Validar nuevas reservas de taxi',
        fechacreacion: new Date()
      },
      {
        id_permisos: 9,
        nombrepermiso: 'iniciar_viaje',
        descripcionpermiso: 'Iniciar un viaje asignado',
        fechacreacion: new Date()
      },
      {
        id_permisos: 10,
        nombrepermiso: 'completar_viaje',
        descripcionpermiso: 'Marcar un viaje como completado',
        fechacreacion: new Date()
      },
      {
        id_permisos: 11,
        nombrepermiso: 'ver_historial',
        descripcionpermiso: 'Ver historial de reservas y viajes',
        fechacreacion: new Date()
      }
    ]);

    // Assign permissions to roles through 'posee' table
    const rolePermissions = [
      // Admin has all permissions
      ...Array.from({ length: 11 }, (_, i) => ({
        id_roles: 1,
        id_permisos: i + 1,
        fcambio: new Date()
      })),
      
      // Regular user permissions
      { 
        id_roles: 2, 
        id_permisos: 5,
        fcambio: new Date()
      },
      { 
        id_roles: 2, 
        id_permisos: 6,
        fcambio: new Date()
      },
      { 
        id_roles: 2, 
        id_permisos: 7,
        fcambio: new Date()
      },
      { 
        id_roles: 2, 
        id_permisos: 11,
        fcambio: new Date()
      },
      
      // Driver permissions
      { 
        id_roles: 3, 
        id_permisos: 7,
        fcambio: new Date()
      },
      { 
        id_roles: 3, 
        id_permisos: 9,
        fcambio: new Date()
      },
      { 
        id_roles: 3, 
        id_permisos: 10,
        fcambio: new Date()
      },
      { 
        id_roles: 3, 
        id_permisos: 11,
        fcambio: new Date()
      }
    ];

    await knex('posee').insert(rolePermissions);
  };