import React from 'react';
import { Droplets, Wind, Gauge } from 'lucide-react';

const WeatherCard = ({ data }) => {
    if (!data) return null;

    const { main, weather, wind, name } = data;
    const temp = Math.round(main.temp);
    const description = weather[0].description;
    const iconCode = weather[0].icon;

    return (
        <div style={{
            padding: '1rem 0',
        }}>
            {/* Main Temperature Display */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2.5rem'
            }}>
                <div style={{
                    fontSize: '6rem',
                    fontWeight: '700',
                    lineHeight: '1',
                    background: 'linear-gradient(135deg, #00f0ff, #b537f2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem',
                }}>
                    {temp}°
                </div>

                <p style={{
                    textTransform: 'capitalize',
                    fontSize: '1.3rem',
                    color: 'var(--text-secondary)',
                    fontWeight: '500',
                    marginBottom: '1rem'
                }}>
                    {description}
                </p>

                <img
                    src={`https://openweathermap.org/img/wn/${iconCode}@4x.png`}
                    alt={description}
                    style={{
                        width: '140px',
                        height: '140px',
                        filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.2))'
                    }}
                />
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
            }}>
                {/* Humidity */}
                <div style={{
                    background: 'rgba(0, 240, 255, 0.05)',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    padding: '1.5rem 1rem',
                    borderRadius: '14px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <Droplets size={24} style={{
                        marginBottom: '10px',
                        color: 'var(--neon-cyan)'
                    }} />
                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                    }}>
                        {main.humidity}%
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: '500'
                    }}>
                        Humedad
                    </div>
                </div>

                {/* Wind */}
                <div style={{
                    background: 'rgba(181, 55, 242, 0.05)',
                    border: '1px solid rgba(181, 55, 242, 0.15)',
                    padding: '1.5rem 1rem',
                    borderRadius: '14px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(181, 55, 242, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(181, 55, 242, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(181, 55, 242, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <Wind size={24} style={{
                        marginBottom: '10px',
                        color: 'var(--neon-purple)'
                    }} />
                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                    }}>
                        {wind.speed}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: '500'
                    }}>
                        Viento m/s
                    </div>
                </div>

                {/* Pressure */}
                <div style={{
                    background: 'rgba(0, 102, 255, 0.05)',
                    border: '1px solid rgba(0, 102, 255, 0.15)',
                    padding: '1.5rem 1rem',
                    borderRadius: '14px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 102, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 102, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <Gauge size={24} style={{
                        marginBottom: '10px',
                        color: 'var(--neon-blue)'
                    }} />
                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                    }}>
                        {main.pressure}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: '500'
                    }}>
                        Presión hPa
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
