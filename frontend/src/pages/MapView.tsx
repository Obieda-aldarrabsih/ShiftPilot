import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Task } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  tasks: Task[];
}

export default function MapView({ tasks }: Props) {
  // Center of Dubai as default mock city
  const defaultCenter: [number, number] = [25.2048, 55.2708];

  // Hash string to generate consistent pseudo-random coordinates around the center
  const getCoordinates = (id: string): [number, number] => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = (hash % 1000) / 10000;
    const lngOffset = ((hash >> 3) % 1000) / 10000;
    
    return [defaultCenter[0] + latOffset - 0.05, defaultCenter[1] + lngOffset - 0.05];
  };

  return (
    <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: 1, overflow: 'hidden' }}>
        <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').map(task => {
            const position = getCoordinates(task.id);
            return (
              <Marker key={task.id} position={position}>
                <Popup>
                  <div style={{ fontWeight: 'bold' }}>{task.referenceCode}</div>
                  <div>{task.customerName}</div>
                  <div style={{ fontSize: '12px', color: 'gray' }}>{task.address}</div>
                  <div style={{ marginTop: '4px', fontWeight: 'bold', color: 'var(--brand-orange)' }}>
                    {task.status.replace('_', ' ')}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
