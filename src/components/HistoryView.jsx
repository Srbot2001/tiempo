import React, { useState, useEffect } from 'react';
import { History, Clock, Thermometer } from 'lucide-react';
import { getSearchHistory } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const HistoryView = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [user]);

    const loadHistory = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const data = await getSearchHistory(user.id, 20);
            setHistory(data);
        } catch (error) {
            console.error('Error cargando historial:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (condition) => {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Snow': '❄️',
            'Thunderstorm': '⛈️',
            'Mist': '🌫️',
            'Fog': '🌫️'
        };
        return icons[condition] || '🌤️';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;

        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)'
            }}>
                Cargando historial...
            </div>
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--text-primary)',
                    margin: 0
                }}>
                    <History size={24} style={{ color: 'var(--neon-purple)' }} />
                    Historial de Búsquedas
                </h2>

                <span style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                }}>
                    {history.length} búsqueda{history.length !== 1 ? 's' : ''}
                </span>
            </div>

            {history.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--text-muted)'
                }}>
                    <History size={48} style={{
                        opacity: 0.3,
                        marginBottom: '1rem'
                    }} />
                    <p>No hay historial de búsquedas</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Consulta el clima desde el dashboard
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    {history.map(item => (
                        <div
                            key={item.id}
                            style={{
                                background: 'rgba(181, 55, 242, 0.05)',
                                border: '1px solid rgba(181, 55, 242, 0.15)',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                display: 'grid',
                                gridTemplateColumns: '1fr auto auto',
                                gap: '16px',
                                alignItems: 'center',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(181, 55, 242, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(181, 55, 242, 0.05)';
                            }}
                        >
                            {/* Ciudad */}
                            <div>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '4px'
                                }}>
                                    {item.nombre_ciudad}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <Clock size={12} />
                                    {formatTime(item.buscado_en)}
                                </div>
                            </div>

                            {/* Temperatura */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <Thermometer size={16} style={{ color: 'var(--neon-cyan)' }} />
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    {Math.round(item.temperatura)}°C
                                </span>
                            </div>

                            {/* Clima */}
                            <div style={{
                                fontSize: '1.5rem'
                            }}>
                                {getWeatherIcon(item.condicion_clima)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{
                marginTop: '1.5rem',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
            }}>
                💡 Se guardan automáticamente tus últimas 100 búsquedas
            </div>
        </div>
    );
};

export default HistoryView;
