exports.seed = async function(knex) {
    // Clean the tables in correct order
    await knex('genera').del();
    await knex('viaje').del();
    await knex('boleta').del();
    
    // Create sample drivers
    const drivers = [
        {
            rut: 123456789,
            nombre: 'Juan',
            apellido_paterno: 'Pérez',
            correo: 'juan@taxiapp.com',
            contrasena: 'hashed_password',
            telefono: '912345678',
            estado_persona: 'ACTIVO',
            id_roles: 3, // CONDUCTOR
            fecha_contratacion: new Date('2023-01-01'),
            licencia_conducir: new Date('2025-01-01'),
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            rut: 987654321,
            nombre: 'María',
            apellido_paterno: 'González',
            correo: 'maria@taxiapp.com',
            contrasena: 'hashed_password',
            telefono: '987654321',
            estado_persona: 'ACTIVO',
            id_roles: 3, // CONDUCTOR
            fecha_contratacion: new Date('2023-02-01'),
            licencia_conducir: new Date('2025-02-01'),
            created_at: new Date(),
            updated_at: new Date()
        }
    ];

    // Create sample taxis
    const taxis = [
        {
            patente: 'ABCD12',
            modelo: 'Corolla',
            marca: 'Toyota',
            ano: 2020,
            color: 'Blanco',
            codigo_taxi: 1,
            estado_taxi: 'ACTIVO',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            patente: 'WXYZ98',
            modelo: 'Accent',
            marca: 'Hyundai',
            ano: 2021,
            color: 'Negro',
            codigo_taxi: 2,
            estado_taxi: 'ACTIVO',
            created_at: new Date(),
            updated_at: new Date()
        }
    ];

    // Insert sample data
    await knex('persona').insert(drivers);
    await knex('taxi').insert(taxis);

    // Create sample bookings
    const bookings = [];
    const viajes = [];
    const boletas = [];
    const genera = [];

    // Generate data for the last 3 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    for (let i = 0; i < 50; i++) {
        const bookingDate = new Date(startDate.getTime() + Math.random() * (new Date() - startDate));
        const driver = drivers[Math.floor(Math.random() * drivers.length)];
        const taxi = taxis[Math.floor(Math.random() * taxis.length)];

        // Create booking
        const booking = {
            codigo_reserva: i + 1,
            rut_cliente: 1, // Admin user as client
            id_oferta: 1, // Using first offer
            origen_reserva: 'Origen Test',
            destino_reserva: 'Destino Test',
            fecha_reserva: bookingDate,
            tipo_reserva: 'NORMAL',
            estado_reserva: 'COMPLETADO',
            rut_conductor: driver.rut,
            patente_taxi: taxi.patente,
            created_at: bookingDate,
            updated_at: bookingDate
        };
        bookings.push(booking);

        // Create trip
        const tripDuration = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
        const viaje = {
            codigo_viaje: i + 1,
            origen_viaje: booking.origen_reserva,
            destino_viaje: booking.destino_reserva,
            duracion: tripDuration,
            pasajeros: Math.floor(Math.random() * 3) + 1,
            fecha_viaje: bookingDate,
            estado_viaje: 'COMPLETADO',
            created_at: bookingDate,
            updated_at: bookingDate
        };
        viajes.push(viaje);

        // Create receipt
        const amount = Math.floor(Math.random() * 15000) + 5000; // 5000-20000 CLP
        const boleta = {
            codigo_boleta: i + 1,
            total: amount,
            fecha_emision: bookingDate,
            metodo_pago: Math.random() > 0.5 ? 'EFECTIVO' : 'TRANSFERENCIA',
            estado_boleta: 'PAGADO',
            created_at: bookingDate,
            updated_at: bookingDate
        };
        boletas.push(boleta);

        // Create junction record
        genera.push({
            codigo_viaje: viaje.codigo_viaje,
            codigo_reserva: booking.codigo_reserva,
            codigo_boleta: boleta.codigo_boleta,
            fecha_generada: bookingDate
        });
    }

    // Insert all records in correct order
    await knex('reserva').insert(bookings);
    await knex('viaje').insert(viajes);
    await knex('boleta').insert(boletas);
    await knex('genera').insert(genera);

    console.log('Sample data for reports has been seeded:', {
        drivers: drivers.length,
        taxis: taxis.length,
        bookings: bookings.length,
        trips: viajes.length,
        receipts: boletas.length
    });
}; 