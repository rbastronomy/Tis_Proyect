import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { createLazyFileRoute } from '@tanstack/react-router';

// Componente RTMap
const RTMap = () => {
    const [positions, setPositions] = useState([]);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyBnDTpGimoFJe0bB-_UwE7wQeehmn2TPzU',
    });

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3000');

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'subscribe', clientId: 'client123' }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'location-update') {
                setPositions((prev) => [...prev, message.payload]);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100vh' }}
            center={{ lat: 51.505, lng: -0.09 }}
            zoom={13}
        >
            {positions.map((pos, index) => (
                <Marker
                    key={index}
                    position={{ lat: pos.latitude, lng: pos.longitude }}
                    label={pos.label}
                />
            ))}
        </GoogleMap>
    );
};

export const Route = createLazyFileRoute('/RTMap')({
    component: RTMap, 
});
