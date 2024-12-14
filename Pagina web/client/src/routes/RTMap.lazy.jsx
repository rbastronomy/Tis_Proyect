import React, { useEffect, useState } from 'react';

const RTMap = () => {
    const [locations, setLocations] = useState({});
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000');
        setWs(socket);

  
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Datos recibidos:', data);

            if (data.type === 'locations_update') {
                setLocations(data.payload);
            }
        };

     
        return () => socket.close();
    }, []);

    const updateLocation = () => {
        if (ws) {
            const fakeLocation = {
                userId: '1234',
                lat: -33.45, 
                lng: -70.66,
            };
            ws.send(JSON.stringify({ type: 'update_location', payload: fakeLocation }));
        }
    };

    return (
        <div>
            <h1>Mapa de Rastreo en Tiempo Real</h1>
            <button onClick={updateLocation}>Enviar Ubicación Falsa</button>
            <ul>
                {Object.entries(locations).map(([userId, { lat, lng }]) => (
                    <li key={userId}>
                        {userId}: {lat}, {lng}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RTMap;
