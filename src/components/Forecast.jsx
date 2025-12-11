import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Forecast = ({ data }) => {
    const { t } = useLanguage();
    if (!data || !data.list) return null;

    // Filter to get one reading per day (e.g., at 12:00 PM)
    const dailyData = data.list.filter(item => item.dt_txt?.includes('12:00:00') || false).slice(0, 5);

    // If filter returns empty (mock data might not have dt_txt), use first 5
    const displayData = dailyData.length > 0 ? dailyData : data.list.slice(0, 5);

    return (
        <div style={{ marginTop: '3rem' }}>
            <h3 style={{
                marginBottom: '1.5rem',
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textAlign: 'center'
            }}>
                {t('forecastTitle')}
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px'
            }}>
                {displayData.map((item, index) => {
                    const date = new Date(item.dt * 1000);
                    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });

                    return (
                        <div
                            key={index}
                            style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '1rem 0.5rem',
                                borderRadius: '14px',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
                                e.currentTarget.style.border = '1px solid rgba(0, 240, 255, 0.3)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <p style={{
                                fontWeight: '600',
                                marginBottom: '8px',
                                fontSize: '0.8rem',
                                color: 'var(--neon-cyan)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {dayName}
                            </p>

                            <img
                                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                alt={item.weather[0].main}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    margin: '0 auto',
                                    filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.2))'
                                }}
                            />

                            <p style={{
                                fontSize: '1.3rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                                marginTop: '8px'
                            }}>
                                {Math.round(item.main.temp)}°
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Forecast;
