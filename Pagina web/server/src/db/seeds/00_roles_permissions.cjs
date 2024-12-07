   // Pagina web/server/src/db/seeds/00_roles_permissions.cjs
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
        fecha_creacion: new Date()
      },
      {
        id_permisos: 3,
        nombre_permiso: 'asignar_rol',
        descripcion_permiso: 'Asignar roles a usuarios',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 4,
        nombre_permiso: 'gestionar_viajes',
        descripcion_permiso: 'Gestionar viajes en el sistema',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 5,
        nombre_permiso: 'crear_reserva',
        descripcion_permiso: 'Crear nuevas reservas de taxi',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 6,
        nombre_permiso: 'cancelar_reserva',
        descripcion_permiso: 'Cancelar reservas existentes',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 7,
        nombre_permiso: 'ver_reservas',
        descripcion_permiso: 'Ver listado de reservas',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 8,
        nombre_permiso: 'validar_reserva',
        descripcion_permiso: 'Validar nuevas reservas de taxi',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 9,
        nombre_permiso: 'iniciar_viaje',
        descripcion_permiso: 'Iniciar un viaje asignado',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 10,
        nombre_permiso: 'completar_viaje',
        descripcion_permiso: 'Marcar un viaje como completado',
        fecha_creacion: new Date()
      },
      {
        id_permisos: 11,
        nombre_permiso: 'ver_historial',
        descripcion_permiso: 'Ver historial de reservas y viajes',
        fecha_creacion: new Date()
      }
    ]);

    // Assign permissions to roles through 'posee' table
    const rolePermissions = [
      // Admin has all permissions
      ...Array.from({ length: 11 }, (_, i) => ({
        id_roles: 1,
        id_permisos: i + 1,
        fecha_cambio_permiso: new Date()
      })),
      
      // Regular user permissions
      { 
        id_roles: 2, 
        id_permisos: 5,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 2, 
        id_permisos: 6,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 2, 
        id_permisos: 7,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 2, 
        id_permisos: 11,
        fecha_cambio_permiso: new Date()
      },
      
      // Driver permissions
      { 
        id_roles: 3, 
        id_permisos: 7,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 3, 
        id_permisos: 9,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 3, 
        id_permisos: 10,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 3, 
        id_permisos: 11,
        fecha_cambio_permiso: new Date()
      }
    ];

    await knex('posee').insert(rolePermissions);
  };