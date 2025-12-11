import React from 'react';
import { signInWithGoogle } from '../services/supabase';
import { Cloud } from 'lucide-react';

const Login = () => {
    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Error al iniciar sesión. Por favor intenta de nuevo.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '450px',
                width: '100%',
                textAlign: 'center',
                padding: '3rem 2rem'
            }}>
                {/* Logo/Icon */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #00f0ff, #b537f2)',
                        borderRadius: '20px',
                        padding: '20px',
                        display: 'inline-block'
                    }}>
                        <Cloud size={64} style={{ color: '#0a0a0f' }} />
                    </div>
                </div>

                {/* Título */}
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #00f0ff, #b537f2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Weather App
                </h1>

                <h2 style={{
                    fontSize: '1.5rem',
                    color: 'var(--text-secondary)',
                    fontWeight: '500',
                    marginBottom: '1rem'
                }}>
                    Bolivia
                </h2>

                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    marginBottom: '3rem',
                    lineHeight: '1.6'
                }}>
                    Consulta el clima de las principales ciudades de Bolivia,
                    guarda favoritos y planifica tus viajes.
                </p>

                {/* Botón de Login con Google */}
                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: '100%',
                        padding: '16px 24px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        background: 'white',
                        color: '#0a0a0f',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 30px rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1)';
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                        <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                        <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                        <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z" fill="#EA4335" />
                    </svg>
                    Continuar con Google
                </button>

                {/* Info adicional */}
                <p style={{
                    marginTop: '2rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5'
                }}>
                    Al iniciar sesión, aceptas nuestros términos y condiciones.
                    Tus datos están protegidos y solo se usan para mejorar tu experiencia.
                </p>
            </div>
        </div>
    );
};

export default Login;
