import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const AlertNotification = ({ alerts, onDismiss }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {alerts.map((alert, index) => (
                <div
                    key={alert.id || index}
                    style={{
                        background: 'rgba(255, 100, 50, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 150, 100, 0.5)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        boxShadow: '0 8px 32px rgba(255, 100, 50, 0.3)',
                        animation: 'slideIn 0.3s ease-out',
                        color: '#fff'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        gap: '12px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            }}>
                                <AlertTriangle size={20} />
                                <strong style={{ fontSize: '1rem' }}>
                                    ¡Alerta Activada!
                                </strong>
                            </div>
                            <div style={{
                                fontSize: '0.95rem',
                                lineHeight: '1.4'
                            }}>
                                {alert.message}
                            </div>
                        </div>
                        <button
                            onClick={() => onDismiss(alert.id)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px',
                                cursor: 'pointer',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlertNotification;
