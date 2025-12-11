import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Check, X, MapPin, Thermometer } from 'lucide-react';
import { getPendingRequests, getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../services/supabase';
import { getWeatherData } from '../services/weather';
import { useAuth } from '../context/AuthContext';

const FriendsView = () => {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendsWeather, setFriendsWeather] = useState({});
    const [loading, setLoading] = useState(true);
    const [friendEmail, setFriendEmail] = useState('');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const [requests, friendsList] = await Promise.all([
                getPendingRequests(user.id),
                getFriends(user.id)
            ]);

            setPendingRequests(requests);
            setFriends(friendsList);
        } catch (error) {
            console.error('Error cargando datos de amigos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();

        if (!friendEmail || !friendEmail.includes('@')) {
            alert('Por favor ingresa un email válido');
            return;
        }

        if (friendEmail === user.email) {
            alert('No puedes agregarte a ti mismo');
            return;
        }

        try {
            await sendFriendRequest(user.id, friendEmail);
            setFriendEmail('');
            setShowForm(false);
            alert('Solicitud enviada correctamente');
        } catch (error) {
            console.error('Error enviando solicitud:', error);
            alert('Error: El usuario no existe o ya enviaste una solicitud');
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await acceptFriendRequest(requestId);
            setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
            await loadData(); // Recargar para actualizar lista de amigos
        } catch (error) {
            console.error('Error aceptando solicitud:', error);
            alert('Error al aceptar solicitud');
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectFriendRequest(requestId);
            setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
        } catch (error) {
            console.error('Error rechazando solicitud:', error);
        }
    };

    const loadFriendWeather = async (friendEmail, friendId) => {
        // Por simplicidad, asumimos que el amigo está en La Paz
        // En una app real, cada usuario tendría su ubicación guardada
        try {
            const weather = await getWeatherData('La Paz');
            setFriendsWeather(prev => ({
                ...prev,
                [friendId]: weather
            }));
        } catch (error) {
            console.error('Error cargando clima del amigo:', error);
        }
    };

    useEffect(() => {
        // Cargar clima de todos los amigos
        friends.forEach(friend => {
            if (!friendsWeather[friend.id_amigo]) {
                loadFriendWeather(friend.email_amigo, friend.id_amigo);
            }
        });
    }, [friends]);

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)'
            }}>
                Cargando...
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
                    <Users size={24} style={{ color: 'var(--neon-cyan)' }} />
                    Amigos
                </h2>

                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        color: 'var(--neon-cyan)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500',
                        fontSize: '0.9rem'
                    }}
                >
                    <UserPlus size={18} />
                    Agregar Amigo
                </button>
            </div>

            {/* Formulario de agregar amigo */}
            {showForm && (
                <form onSubmit={handleSendRequest} style={{
                    background: 'rgba(0, 240, 255, 0.05)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        color: 'var(--text-primary)'
                    }}>
                        Enviar Solicitud de Amistad
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px',
                                display: 'block'
                            }}>
                                Email del amigo
                            </label>
                            <input
                                type="email"
                                placeholder="amigo@ejemplo.com"
                                value={friendEmail}
                                onChange={(e) => setFriendEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginTop: '8px'
                        }}>
                            <button type="submit" style={{
                                flex: 1,
                                padding: '10px',
                                background: 'var(--neon-cyan)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#0a0a0f',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                Enviar Solicitud
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Solicitudes pendientes */}
            {pendingRequests.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📬 Solicitudes Pendientes ({pendingRequests.length})
                    </h3>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {pendingRequests.map(request => (
                            <div
                                key={request.id}
                                style={{
                                    background: 'rgba(255, 215, 0, 0.05)',
                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '4px'
                                    }}>
                                        Solicitud de amistad
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)'
                                    }}>
                                        Usuario con ID: {request.usuario_id.substring(0, 8)}...
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <button
                                        onClick={() => handleAccept(request.id)}
                                        style={{
                                            background: 'rgba(0, 255, 0, 0.1)',
                                            border: '1px solid rgba(0, 255, 0, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            color: '#00ff00',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                        title="Aceptar"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
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
                                        title="Rechazar"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lista de amigos */}
            <h3 style={{
                fontSize: '1.1rem',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
            }}>
                Mis Amigos ({friends.length})
            </h3>

            {friends.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--text-muted)'
                }}>
                    <Users size={48} style={{
                        opacity: 0.3,
                        marginBottom: '1rem'
                    }} />
                    <p>Aún no tienes amigos agregados</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Envía una solicitud de amistad para comenzar
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {friends.map(friend => {
                        const weather = friendsWeather[friend.id_amigo];

                        return (
                            <div
                                key={friend.id_amigo}
                                style={{
                                    background: 'rgba(0, 240, 255, 0.05)',
                                    border: '1px solid rgba(0, 240, 255, 0.15)',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    marginBottom: weather ? '12px' : '0'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            marginBottom: '4px'
                                        }}>
                                            {friend.email_amigo}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            Amigos desde {new Date(friend.desde).toLocaleDateString('es-ES', {
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(0, 255, 0, 0.1)',
                                        border: '1px solid rgba(0, 255, 0, 0.2)',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        fontSize: '0.75rem',
                                        color: '#00ff00',
                                        fontWeight: '600'
                                    }}>
                                        Activo
                                    </div>
                                </div>

                                {/* Clima del amigo */}
                                {weather && !weather.isMock && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '10px',
                                        alignItems: 'center'
                                    }}>
                                        <MapPin size={16} style={{ color: 'var(--neon-cyan)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                La Paz
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <Thermometer size={16} style={{ color: 'var(--neon-cyan)' }} />
                                            <span style={{
                                                fontSize: '1.2rem',
                                                fontWeight: '700',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {Math.round(weather.main.temp)}°C
                                            </span>
                                        </div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'capitalize'
                                        }}>
                                            {weather.weather[0].description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
                💡 Comparte el clima con tus amigos y mantente conectado
            </div>
        </div>
    );
};

export default FriendsView;
