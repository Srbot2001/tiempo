import React, { useState, useEffect } from 'react';
import { Plane, Plus, Trash2, Calendar, MapPin, Edit } from 'lucide-react';
import { getPlannedTrips, addTrip, deleteTrip } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const TripsView = () => {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        ciudad: 'La Paz',
        fecha_inicio: '',
        fecha_fin: '',
        notas: ''
    });

    const cities = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Sucre', 'Tarija', 'Potosí', 'Trinidad', 'Cobija'];

    useEffect(() => {
        loadTrips();
    }, [user]);

    const loadTrips = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const data = await getPlannedTrips(user.id);
            setTrips(data);
        } catch (error) {
            console.error('Error cargando viajes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fecha_inicio || !formData.fecha_fin) {
            alert('Por favor completa las fechas');
            return;
        }

        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            alert('La fecha de fin debe ser posterior a la de inicio');
            return;
        }

        try {
            const newTrip = await addTrip(
                user.id,
                formData.ciudad,
                formData.fecha_inicio,
                formData.fecha_fin,
                formData.notas
            );

            setTrips([...trips, newTrip].sort((a, b) =>
                new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
            ));

            setFormData({ ciudad: 'La Paz', fecha_inicio: '', fecha_fin: '', notas: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error creando viaje:', error);
            alert('Error al crear viaje');
        }
    };

    const handleDelete = async (tripId) => {
        if (!confirm('¿Eliminar este viaje?')) return;

        try {
            await deleteTrip(tripId);
            setTrips(trips.filter(t => t.id !== tripId));
        } catch (error) {
            console.error('Error eliminando viaje:', error);
            alert('Error al eliminar viaje');
        }
    };

    const getDaysUntil = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'En progreso';
        if (diff === 0) return 'Hoy';
        if (diff === 1) return 'Mañana';
        return `En ${diff} días`;
    };

    const getTripDuration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        return `${diff} día${diff > 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)'
            }}>
                Cargando viajes...
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
                    <Plane size={24} style={{ color: 'var(--neon-purple)' }} />
                    Viajes Planificados
                </h2>

                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: 'rgba(181, 55, 242, 0.1)',
                        border: '1px solid rgba(181, 55, 242, 0.3)',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        color: 'var(--neon-purple)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500',
                        fontSize: '0.9rem'
                    }}
                >
                    <Plus size={18} />
                    Nuevo Viaje
                </button>
            </div>

            {/* Formulario de nuevo viaje */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{
                    background: 'rgba(181, 55, 242, 0.05)',
                    border: '1px solid rgba(181, 55, 242, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        color: 'var(--text-primary)'
                    }}>
                        Planificar Nuevo Viaje
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px',
                                display: 'block'
                            }}>
                                Destino
                            </label>
                            <select
                                value={formData.ciudad}
                                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }}>
                            <div>
                                <label style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '6px',
                                    display: 'block'
                                }}>
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
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

                            <div>
                                <label style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '6px',
                                    display: 'block'
                                }}>
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_fin}
                                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
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
                        </div>

                        <div>
                            <label style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px',
                                display: 'block'
                            }}>
                                Notas (opcional)
                            </label>
                            <textarea
                                placeholder="Detalles del viaje..."
                                rows="3"
                                value={formData.notas}
                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
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
                                background: 'var(--neon-purple)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#0a0a0f',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                Guardar Viaje
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

            {/* Lista de viajes */}
            {trips.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--text-muted)'
                }}>
                    <Plane size={48} style={{
                        opacity: 0.3,
                        marginBottom: '1rem'
                    }} />
                    <p>No tienes viajes planificados</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Planifica un viaje y monitorea el clima del destino
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                }}>
                    {trips.map(trip => (
                        <div
                            key={trip.id}
                            style={{
                                background: 'rgba(181, 55, 242, 0.05)',
                                border: '1px solid rgba(181, 55, 242, 0.15)',
                                borderRadius: '14px',
                                padding: '18px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(181, 55, 242, 0.08)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(181, 55, 242, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Header del viaje */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                marginBottom: '12px'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '6px'
                                    }}>
                                        <MapPin size={18} style={{ color: 'var(--neon-purple)' }} />
                                        <h3 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            margin: 0
                                        }}>
                                            {trip.nombre_ciudad}
                                        </h3>
                                    </div>

                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        background: 'rgba(181, 55, 242, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        color: 'var(--neon-purple)',
                                        fontWeight: '600'
                                    }}>
                                        {getDaysUntil(trip.fecha_inicio)}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(trip.id)}
                                    style={{
                                        background: 'rgba(255, 0, 0, 0.1)',
                                        border: '1px solid rgba(255, 0, 0, 0.2)',
                                        borderRadius: '8px',
                                        padding: '6px',
                                        color: '#ff6b6b',
                                        cursor: 'pointer'
                                    }}
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Fechas */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr auto',
                                gap: '12px',
                                marginBottom: '12px',
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: '4px'
                                    }}>
                                        Inicio
                                    </div>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {new Date(trip.fecha_inicio).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: '4px'
                                    }}>
                                        Fin
                                    </div>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {new Date(trip.fecha_fin).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '0 12px',
                                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <Calendar size={16} style={{ color: 'var(--neon-purple)' }} />
                                    <span style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {getTripDuration(trip.fecha_inicio, trip.fecha_fin)}
                                    </span>
                                </div>
                            </div>

                            {/* Notas */}
                            {trip.notas && (
                                <div style={{
                                    padding: '10px 12px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    fontStyle: 'italic'
                                }}>
                                    "{trip.notas}"
                                </div>
                            )}
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
                💡 Monitorea automáticamente el pronóstico de tus destinos
            </div>
        </div>
    );
};

export default TripsView;
