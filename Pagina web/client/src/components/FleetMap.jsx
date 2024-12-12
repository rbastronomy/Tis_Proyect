import { useEffect, useState } from 'react';
import Map from './Map';
import { Card, CardBody, Chip } from "@nextui-org/react";

export function FleetMap({ activeTaxis = [] }) {
  const [mapCenter, setMapCenter] = useState({ lat: -20.2133, lon: -70.1503 }); // Iquique center

  return (
    <Card className="w-full h-[500px]">
      <CardBody className="p-0 relative">
        <Map position={mapCenter} className="w-full h-full">
          {activeTaxis.map((taxi) => (
            <div 
              key={taxi.patente}
              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${taxi.location.lng}%`, 
                top: `${taxi.location.lat}%` 
              }}
            >
              <Chip
                variant="shadow"
                classNames={{
                  base: "bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
                  content: "drop-shadow shadow-black text-white",
                }}
              >
                {taxi.patente}
              </Chip>
            </div>
          ))}
        </Map>
      </CardBody>
    </Card>
  );
} 