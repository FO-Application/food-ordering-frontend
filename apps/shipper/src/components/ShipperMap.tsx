import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Default Icon Issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const driverIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/9561/9561688.png', // Motorcycle Delivery Rider
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
});

const storeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png', // Restaurant Icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

const customerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png', // User Icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

interface ShipperMapProps {
    location: { lat: number; lon: number };
    destination?: { lat: number; lon: number; type: 'STORE' | 'CUSTOMER' } | null;
}

const MapUpdater = ({ center }: { center: { lat: number; lon: number } }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([center.lat, center.lon], 15);
    }, [center, map]);
    return null;
};

const ShipperMap: React.FC<ShipperMapProps> = ({ location, destination }) => {
    return (
        <MapContainer
            center={[location.lat, location.lon]}
            zoom={15}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />

            <MapUpdater center={location} />

            {/* Driver Marker */}
            <Marker position={[location.lat, location.lon]} icon={driverIcon}>
                <Popup>You are here</Popup>
            </Marker>

            {/* Destination Marker */}
            {destination && (
                <Marker position={[destination.lat, destination.lon]} icon={destination.type === 'STORE' ? storeIcon : customerIcon}>
                    <Popup>{destination.type === 'STORE' ? 'Pick up here' : 'Deliver here'}</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default ShipperMap;
