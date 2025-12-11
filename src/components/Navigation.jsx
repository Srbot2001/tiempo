import React, { useState } from 'react';
import { Home, Star, History, Bell, Plane, Users } from 'lucide-react';

const Navigation = ({ currentView, onViewChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Clima', icon: Home },
        { id: 'favorites', label: 'Favoritos', icon: Star },
        { id: 'history', label: 'Historial', icon: History },
        { id: 'alerts', label: 'Alertas', icon: Bell },
        { id: 'trips', label: 'Viajes', icon: Plane },
        { id: 'friends', label: 'Amigos', icon: Users },
    ];

    return (
        <nav style={{
            display: 'flex',
            gap: '8px',
            padding: '16px 0',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            overflowX: 'auto'
        }}>
            {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: isActive
                                ? 'rgba(0, 240, 255, 0.1)'
                                : 'rgba(255, 255, 255, 0.03)',
                            border: isActive
                                ? '1px solid rgba(0, 240, 255, 0.3)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            color: isActive ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                            }
                        }}
                    >
                        <Icon size={18} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default Navigation;
