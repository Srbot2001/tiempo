import React from 'react';
import { MapPin } from 'lucide-react';

const cities = [
    'La Paz',
    'Santa Cruz',
    'Cochabamba',
    'Oruro',
    'Sucre',
    'Tarija',
    'Potosí',
    'Trinidad',
    'Cobija'
];

const CitySelector = ({ selectedCity, onCityChange }) => {
    return (
        <div style={{ marginBottom: '2rem' }}>
            <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: '500',
            }}>
                <MapPin size={16} />
                <span>Selecciona una ciudad</span>
            </label>
            <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '400',
                }}
            >
                {cities.map(city => (
                    <option
                        key={city}
                        value={city}
                        style={{
                            background: '#1a1a24',
                            color: '#ffffff'
                        }}
                    >
                        {city}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CitySelector;
