import { useState, useEffect } from 'react'
import './index.css'
import Login from './components/Login'
import Navigation from './components/Navigation'
import CitySelector from './components/CitySelector'
import WeatherCard from './components/WeatherCard'
import Forecast from './components/Forecast'
import FavoritesView from './components/FavoritesView'
import HistoryView from './components/HistoryView'
import AlertsView from './components/AlertsView'
import TripsView from './components/TripsView'
import FriendsView from './components/FriendsView'
import AlertNotification from './components/AlertNotification'
import { getWeatherData, getForecastData } from './services/weather'
import { addSearchHistory, checkActiveAlerts, isFavorite, addFavorite, removeFavorite, getFavorites } from './services/supabase'
import { useLanguage } from './context/LanguageContext'
import { useAuth } from './context/AuthContext'
import { LogOut, Star } from 'lucide-react'

function App() {
  const { t, language, setLanguage } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [city, setCity] = useState('La Paz');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  useEffect(() => {
    if (user && currentView === 'dashboard') {
      fetchData();
      checkIfFavorite();
    }
  }, [city, user, currentView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const weatherData = await getWeatherData(city);
      const forecastData = await getForecastData(city);
      setWeather(weatherData);
      setForecast(forecastData);
      setUsingMockData(weatherData?.isMock || false);

      // Guardar en historial si el usuario está logueado
      if (user && !weatherData?.isMock) {
        await addSearchHistory(
          user.id,
          city,
          weatherData.main.temp,
          weatherData.weather[0].main
        );

        // Verificar alertas activas
        const alerts = await checkActiveAlerts(user.id, weatherData);
        if (alerts.length > 0) {
          const alertMessages = alerts.map(alert => ({
            id: alert.id,
            message: `${city}: ${getAlertMessage(alert, weatherData)}`
          }));
          setTriggeredAlerts(alertMessages);
        }
      }
    } catch (error) {
      console.error("Error obteniendo datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user) return;

    try {
      const favorites = await getFavorites(user.id);
      const fav = favorites.find(f => f.nombre_ciudad === city);
      if (fav) {
        setIsFavorited(true);
        setFavoriteId(fav.id);
      } else {
        setIsFavorited(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error('Error verificando favorito:', error);
    }
  };

  const getAlertMessage = (alert, weatherData) => {
    const temp = weatherData.main.temp;
    switch (alert.tipo_condicion) {
      case 'temp_mayor':
        return `La temperatura (${Math.round(temp)}°C) superó el umbral de ${alert.valor_umbral}°C`;
      case 'temp_menor':
        return `La temperatura (${Math.round(temp)}°C) bajó del umbral de ${alert.valor_umbral}°C`;
      case 'lluvia':
        return 'Está lloviendo';
      case 'viento':
        return `El viento (${weatherData.wind.speed} m/s) superó el umbral de ${alert.valor_umbral} m/s`;
      default:
        return 'Condición cumplida';
    }
  };

  const handleDismissAlert = (alertId) => {
    setTriggeredAlerts(triggeredAlerts.filter(a => a.id !== alertId));
  };

  const toggleFavorite = async () => {
    if (!user) return;

    try {
      if (isFavorited) {
        // Eliminar de favoritos
        await removeFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
      } else {
        // Agregar a favoritos
        const newFav = await addFavorite(user.id, city);
        setIsFavorited(true);
        setFavoriteId(newFav.id);
      }
    } catch (error) {
      console.error('Error toggling favorito:', error);
      alert('Error al actualizar favoritos');
    }
  };

  const handleCitySelectFromFavorites = (cityName) => {
    setCity(cityName);
    setCurrentView('dashboard');
  };

  // Mostrar pantalla de carga mientras verifica auth
  if (authLoading) {
    return (
      <div className="app-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--text-secondary)',
          fontSize: '1.2rem'
        }}>
          {t('loading')}...
        </div>
      </div>
    );
  }

  // Mostrar Login si no hay usuario
  if (!user) {
    return <Login />;
  }

  // Renderizar vista actual
  const renderView = () => {
    switch (currentView) {
      case 'favorites':
        return <FavoritesView onCitySelect={handleCitySelectFromFavorites} />;
      case 'history':
        return <HistoryView />;
      case 'alerts':
        return <AlertsView />;
      case 'trips':
        return <TripsView />;
      case 'friends':
        return <FriendsView />;
      case 'dashboard':
      default:
        return (
          <>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <CitySelector selectedCity={city} onCityChange={setCity} />
              </div>

              {/* Botón agregar/quitar favorito */}
              <button
                onClick={toggleFavorite}
                style={{
                  background: isFavorited
                    ? 'rgba(255, 215, 0, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isFavorited
                    ? '1px solid rgba(255, 215, 0, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: isFavorited ? '#ffd700' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '32px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isFavorited) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFavorited) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                title={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Star size={18} fill={isFavorited ? '#ffd700' : 'none'} />
              </button>
            </div>

            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                {t('loading')}...
              </div>
            ) : (
              <>
                <WeatherCard data={weather} />
                <Forecast data={forecast} />
              </>
            )}
          </>
        );
    }
  };

  // Mostrar App si está logueado
  return (
    <div className="app-container">
      {/* Notificaciones de alertas */}
      <AlertNotification
        alerts={triggeredAlerts}
        onDismiss={handleDismissAlert}
      />

      <div className="glass-panel" style={{
        maxWidth: '700px',
        width: '100%',
        margin: '20px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          <h1 style={{
            fontSize: '2rem',
            margin: '0 0 0.5rem 0'
          }}>
            {t('appTitle')}
          </h1>

          {/* User info y controles */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1rem',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {/* User info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid var(--neon-cyan)'
                  }}
                />
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  {user.user_metadata?.full_name || user.email}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  {user.email}
                </div>
              </div>
            </div>

            {/* Controles */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              {/* Cambiar idioma */}
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: 'var(--text-secondary)',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {language.toUpperCase()}
              </button>

              {/* Logout */}
              <button
                onClick={signOut}
                style={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Cerrar sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Mock Data Alert */}
        {usingMockData && currentView === 'dashboard' && (
          <div style={{
            background: 'rgba(255, 165, 0, 0.08)',
            border: '1px solid rgba(255, 165, 0, 0.2)',
            color: '#ffa500',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}>
            ⚠️ Usando datos de prueba (API Key inactiva)
          </div>
        )}

        {/* Navegación */}
        <Navigation currentView={currentView} onViewChange={setCurrentView} />

        {/* Contenido de la vista actual */}
        {renderView()}
      </div>
    </div>
  )
}

export default App
