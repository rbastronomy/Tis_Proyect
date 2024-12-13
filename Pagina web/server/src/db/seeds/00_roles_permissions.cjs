   // Pagina web/server/src/db/seeds/00_roles_permissions.cjs
   exports.seed = async function(knex) {
    // First delete from junction tables and dependent tables
    await knex('posee').del();
    await knex('permiso').del();
    
    // Instead of deleting existing roles, we'll update them
    await knex('roles')
        .where('id_roles', 1)
        .update({
            nombre_rol: 'ADMINISTRADOR',
            descripcion_rol: 'Administrador con acceso completo al sistema',
            fecha_creada_rol: new Date(),
            estado_rol: 'ACTIVO'
        });

    await knex('roles')
        .where('id_roles', 2)
        .update({
            nombre_rol: 'CLIENTE',
            descripcion_rol: 'Cliente del sistema',
            fecha_creada_rol: new Date(),
            estado_rol: 'ACTIVO'
        });

    await knex('roles')
        .where('id_roles', 3)
        .update({
            nombre_rol: 'CONDUCTOR',
            descripcion_rol: 'Conductor de taxi con acceso a viajes',
            fecha_creada_rol: new Date(),
            estado_rol: 'ACTIVO'
        });

    // Insert any missing roles
    const existingRoles = await knex('roles').select('id_roles');
    const existingRoleIds = existingRoles.map(r => r.id_roles);

    const rolesToInsert = [
        { 
            id_roles: 1,
            nombre_rol: 'ADMINISTRADOR',
            descripcion_rol: 'Administrador con acceso completo al sistema',
            fecha_creada_rol: new Date(),
            estado_rol: 'ACTIVO'
        },
        { 
            id_roles: 2,
            nombre_rol: 'CLIENTE',
            descripcion_rol: 'Cliente del sistema',
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
    ].filter(role => !existingRoleIds.includes(role.id_roles));

    if (rolesToInsert.length > 0) {
        await knex('roles').insert(rolesToInsert);
    }

    // Insert permissions
    await knex('permiso').insert([
      {
        id_permiso: 1,
        nombre_permiso: 'crear_usuario',
        descripcion_permiso: 'Crear nuevos usuarios en el sistema',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 2,
        nombre_permiso: 'eliminar_usuario',
        descripcion_permiso: 'Eliminar usuarios existentes',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 3,
        nombre_permiso: 'asignar_rol',
        descripcion_permiso: 'Asignar roles a usuarios',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 4,
        nombre_permiso: 'gestionar_viajes',
        descripcion_permiso: 'Gestionar viajes en el sistema',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 5,
        nombre_permiso: 'crear_reserva',
        descripcion_permiso: 'Crear nuevas reservas de taxi',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 6,
        nombre_permiso: 'cancelar_reserva',
        descripcion_permiso: 'Cancelar reservas existentes',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 7,
        nombre_permiso: 'ver_reservas',
        descripcion_permiso: 'Ver listado de reservas',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 8,
        nombre_permiso: 'validar_reserva',
        descripcion_permiso: 'Validar nuevas reservas de taxi',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 9,
        nombre_permiso: 'iniciar_viaje',
        descripcion_permiso: 'Iniciar un viaje asignado',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 10,
        nombre_permiso: 'completar_viaje',
        descripcion_permiso: 'Marcar un viaje como completado',
        fecha_creacion: new Date()
      },
      {
        id_permiso: 11,
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
        id_permiso: i + 1,
        fecha_cambio_permiso: new Date()
      })),
      
      // Regular user permissions
      { 
        id_roles: 2, 
        id_permiso: 5,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 2, 
        id_permiso: 6,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 2, 
        id_permiso: 7,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 2, 
        id_permiso: 11,
        fecha_cambio_permiso: new Date()
      },
      
      // Driver permissions
      { 
        id_roles: 3, 
        id_permiso: 7,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 3, 
        id_permiso: 9,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 3, 
        id_permiso: 10,
        fecha_cambio_permiso: new Date()
      },
      { 
        id_roles: 3, 
        id_permiso: 11,
        fecha_cambio_permiso: new Date()
      }
    ];

    await knex('posee').insert(rolePermissions);
  };