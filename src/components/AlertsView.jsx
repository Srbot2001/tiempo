import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAlerts, addAlert, toggleAlert, deleteAlert } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const AlertsView = () => {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        ciudad: 'La Paz',
        tipo: 'temp_mayor',
        valor: ''
    });

    const cities = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Sucre', 'Tarija', 'Potosí', 'Trinidad', 'Cobija'];

    useEffect(() => {
        loadAlerts();
    }, [user]);

    const loadAlerts = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const data = await getAlerts(user.id);
            setAlerts(data);
        } catch (error) {
            console.error('Error cargando alertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.valor && formData.tipo !== 'lluvia') {
            alert('Por favor ingresa un valor');
            return;
        }

        try {
            const newAlert = await addAlert(
                user.id,
                formData.ciudad,
                formData.tipo,
                formData.valor ? parseFloat(formData.valor) : null
            );

            setAlerts([newAlert, ...alerts]);
            setFormData({ ciudad: 'La Paz', tipo: 'temp_mayor', valor: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error creando alerta:', error);
            alert('Error al crear alerta');
        }
    };

    const handleToggle = async (alertId, currentState) => {
        try {
            await toggleAlert(alertId, !currentState);
            setAlerts(alerts.map(a =>
                a.id === alertId ? { ...a, esta_activa: !currentState } : a
            ));
        } catch (error) {
            console.error('Error cambiando estado:', error);
        }
    };

    const handleDelete = async (alertId) => {
        if (!confirm('¿Eliminar esta alerta?')) return;

        try {
            await deleteAlert(alertId);
            setAlerts(alerts.filter(a => a.id !== alertId));
        } catch (error) {
            console.error('Error eliminando alerta:', error);
            alert('Error al eliminar alerta');
        }
    };

    const getAlertLabel = (tipo, valor) => {
        const labels = {
            'temp_mayor': `Temperatura mayor a ${valor}°C`,
            'temp_menor': `Temperatura menor a ${valor}°C`,
            'lluvia': 'Cuando llueva',
            'viento': `Viento mayor a ${valor} m/s`
        };
        return labels[tipo] || tipo;
    };

    const getAlertColor = (tipo) => {
        const colors = {
            'temp_mayor': { bg: 'rgba(255, 100, 100, 0.1)', border: 'rgba(255, 100, 100, 0.3)', text: '#ff6b6b' },
            'temp_menor': { bg: 'rgba(100, 200, 255, 0.1)', border: 'rgba(100, 200, 255, 0.3)', text: '#64c8ff' },
            'lluvia': { bg: 'rgba(0, 150, 255, 0.1)', border: 'rgba(0, 150, 255, 0.3)', text: '#0096ff' },
            'viento': { bg: 'rgba(150, 255, 150, 0.1)', border: 'rgba(150, 255, 150, 0.3)', text: '#96ff96' }
        };
        return colors[tipo] || colors.temp_mayor;
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)'
            }}>
                Cargando alertas...
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
                    <Bell size={24} style={{ color: 'var(--neon-blue)' }} />
                    Alertas Climáticas
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
                    <Plus size={18} />
                    Nueva Alerta
                </button>
            </div>

            {/* Formulario de nueva alerta */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{
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
                        Crear Nueva Alerta
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px',
                                display: 'block'
                            }}>
                                Ciudad
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

                        <div>
                            <label style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px',
                                display: 'block'
                            }}>
                                Tipo de Alerta
                            </label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
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
                                <option value="temp_mayor">Temperatura mayor a...</option>
                                <option value="temp_menor">Temperatura menor a...</option>
                                <option value="lluvia">Cuando llueva</option>
                                <option value="viento">Viento fuerte</option>
                            </select>
                        </div>

                        {formData.tipo !== 'lluvia' && (
                            <div>
                                <label style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '6px',
                                    display: 'block'
                                }}>
                                    Valor (°C o m/s)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Ej: 30"
                                    value={formData.valor}
                                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                    step="0.1"
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
                        )}

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
                                Crear Alerta
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

            {/* Lista de alertas */}
            {alerts.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--text-muted)'
                }}>
                    <Bell size={48} style={{
                        opacity: 0.3,
                        marginBottom: '1rem'
                    }} />
                    <p>No tienes alertas configuradas</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Crea una alerta para recibir notificaciones
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {alerts.map(alert => {
                        const colors = getAlertColor(alert.tipo_condicion);

                        return (
                            <div
                                key={alert.id}
                                style={{
                                    background: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            marginBottom: '6px'
                                        }}>
                                            {alert.nombre_ciudad}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: colors.text
                                        }}>
                                            {getAlertLabel(alert.tipo_condicion, alert.valor_umbral)}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '8px'
                                    }}>
                                        {/* Toggle activa/inactiva */}
                                        <button
                                            onClick={() => handleToggle(alert.id, alert.esta_activa)}
                                            style={{
                                                background: alert.esta_activa
                                                    ? 'rgba(0, 255, 0, 0.1)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                                border: alert.esta_activa
                                                    ? '1px solid rgba(0, 255, 0, 0.3)'
                                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                padding: '6px',
                                                cursor: 'pointer',
                                                color: alert.esta_activa ? '#00ff00' : 'var(--text-muted)'
                                            }}
                                            title={alert.esta_activa ? 'Activa' : 'Inactiva'}
                                        >
                                            {alert.esta_activa ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        </button>

                                        {/* Eliminar */}
                                        <button
                                            onClick={() => handleDelete(alert.id)}
                                            style={{
                                                background: 'rgba(255, 0, 0, 0.1)',
                                                border: '1px solid rgba(255, 0, 0, 0.2)',
                                                borderRadius: '8px',
                                                padding: '6px',
                                                color: '#ff6b6b',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {alert.esta_activa && (
                                    <div style={{
                                        marginTop: '10px',
                                        padding: '8px 12px',
                                        background: 'rgba(0, 255, 0, 0.05)',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        color: '#00ff00'
                                    }}>
                                        ✓ Alerta activa - Recibirás notificaciones en la app
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AlertsView;
