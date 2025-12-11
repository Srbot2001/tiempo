import React, { useState, useEffect } from 'react';
import { Star, Trash2, MapPin } from 'lucide-react';
import { getFavorites, removeFavorite } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const FavoritesView = ({ onCitySelect }) => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, [user]);

    const loadFavorites = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const data = await getFavorites(user.id);
            setFavorites(data);
        } catch (error) {
            console.error('Error cargando favoritos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (favoriteId) => {
        if (!confirm('¿Eliminar esta ciudad de favoritos?')) return;

        try {
            await removeFavorite(favoriteId);
            setFavorites(favorites.filter(fav => fav.id !== favoriteId));
        } catch (error) {
            console.error('Error eliminando favorito:', error);
            alert('Error al eliminar favorito');
        }
    };

    const handleCityClick = (cityName) => {
        if (onCitySelect) {
            onCitySelect(cityName);
        }
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)'
            }}>
                Cargando favoritos...
            </div>
        );
    }

    return (
        <div>
            <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-primary)'
            }}>
                <Star size={24} style={{ color: 'var(--neon-cyan)' }} />
                Ciudades Favoritas
            </h2>

            {favorites.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--text-muted)'
                }}>
                    <Star size={48} style={{
                        opacity: 0.3,
                        marginBottom: '1rem'
                    }} />
                    <p>No tienes ciudades favoritas aún</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Agrega ciudades desde el dashboard
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {favorites.map(fav => (
                        <div
                            key={fav.id}
                            style={{
                                background: 'rgba(0, 240, 255, 0.05)',
                                border: '1px solid rgba(0, 240, 255, 0.15)',
                                borderRadius: '12px',
                                padding: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleCityClick(fav.nombre_ciudad)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <MapPin size={20} style={{ color: 'var(--neon-cyan)' }} />
                                <div>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {fav.nombre_ciudad}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '2px'
                                    }}>
                                        Agregado el {new Date(fav.creado_en).toLocaleDateString('es-ES')}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(fav.id);
                                }}
                                style={{
                                    background: 'rgba(255, 0, 0, 0.1)',
                                    border: '1px solid rgba(255, 0, 0, 0.2)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: '#ff6b6b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title="Eliminar de favoritos"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesView;
