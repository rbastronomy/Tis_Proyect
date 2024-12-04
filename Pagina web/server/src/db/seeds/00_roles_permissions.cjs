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
        nombrerol: 'ADMINISTRADOR',
        descripcionrol: 'Administrador con acceso completo al sistema',
        fechacreadarol: new Date(),
        estadorol: 'ACTIVO'
      },
      { 
        idroles: 2,
        nombrerol: 'USUARIO',
        descripcionrol: 'Usuario regular del sistema',
        fechacreadarol: new Date(),
        estadorol: 'ACTIVO'
      },
      { 
        idroles: 3,
        nombrerol: 'CONDUCTOR',
        descripcionrol: 'Conductor de taxi con acceso a viajes',
        fechacreadarol: new Date(),
        estadorol: 'ACTIVO'
      }
    ]);

    // Insert permissions
    await knex('permiso').insert([
      {
        idpermisos: 1,
        nombrepermiso: 'crear_usuario',
        descripcionpermiso: 'Crear nuevos usuarios en el sistema',
        fechacreacion: new Date()
      },
      {
        idpermisos: 2,
        nombrepermiso: 'eliminar_usuario',
        descripcionpermiso: 'Eliminar usuarios existentes',
        fechacreacion: new Date()
      },
      {
        idpermisos: 3,
        nombrepermiso: 'asignar_rol',
        descripcionpermiso: 'Asignar roles a usuarios',
        fechacreacion: new Date()
      },
      {
        idpermisos: 4,
        nombrepermiso: 'gestionar_viajes',
        descripcionpermiso: 'Gestionar viajes en el sistema',
        fechacreacion: new Date()
      },
      {
        idpermisos: 5,
        nombrepermiso: 'crear_reserva',
        descripcionpermiso: 'Crear nuevas reservas de taxi',
        fechacreacion: new Date()
      },
      {
        idpermisos: 6,
        nombrepermiso: 'cancelar_reserva',
        descripcionpermiso: 'Cancelar reservas existentes',
        fechacreacion: new Date()
      },
      {
        idpermisos: 7,
        nombrepermiso: 'ver_reservas',
        descripcionpermiso: 'Ver listado de reservas',
        fechacreacion: new Date()
      },
      {
        idpermisos: 8,
        nombrepermiso: 'validar_reserva',
        descripcionpermiso: 'Validar nuevas reservas de taxi',
        fechacreacion: new Date()
      },
      {
        idpermisos: 9,
        nombrepermiso: 'iniciar_viaje',
        descripcionpermiso: 'Iniciar un viaje asignado',
        fechacreacion: new Date()
      },
      {
        idpermisos: 10,
        nombrepermiso: 'completar_viaje',
        descripcionpermiso: 'Marcar un viaje como completado',
        fechacreacion: new Date()
      },
      {
        idpermisos: 11,
        nombrepermiso: 'ver_historial',
        descripcionpermiso: 'Ver historial de reservas y viajes',
        fechacreacion: new Date()
      }
    ]);

    // Assign permissions to roles through 'posee' table
    const rolePermissions = [
      // Admin has all permissions
      ...Array.from({ length: 11 }, (_, i) => ({
        idroles: 1,
        idpermisos: i + 1,
        fcambio: new Date()
      })),
      
      // Regular user permissions
      { 
        idroles: 2, 
        idpermisos: 5, // crear_reserva
        fcambio: new Date()
      },
      { 
        idroles: 2, 
        idpermisos: 6, // cancelar_reserva
        fcambio: new Date()
      },
      { 
        idroles: 2, 
        idpermisos: 7, // ver_reservas (solo las propias)
        fcambio: new Date()
      },
      { 
        idroles: 2, 
        idpermisos: 11, // ver_historial (solo el propio)
        fcambio: new Date()
      },
      
      // Driver permissions
      { 
        idroles: 3, 
        idpermisos: 7, // ver_reservas (asignadas)
        fcambio: new Date()
      },
      { 
        idroles: 3, 
        idpermisos: 9, // iniciar_viaje
        fcambio: new Date()
      },
      { 
        idroles: 3, 
        idpermisos: 10, // completar_viaje
        fcambio: new Date()
      },
      { 
        idroles: 3, 
        idpermisos: 11, // ver_historial (de sus viajes)
        fcambio: new Date()
      }
    ];

    await knex('posee').insert(rolePermissions);
  };