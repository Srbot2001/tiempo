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
import { useAuth } from './context/AuthContext'
import { LogOut, Star } from 'lucide-react'

function App() {
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

  // Detectar ubicación al cargar
  useEffect(() => {
    if (!user) return;

    const detectLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const nearestCity = findNearestBolivianCity(latitude, longitude);
            setCity(nearestCity);
          },
          (error) => {
            console.log('Geolocalización no disponible, usando La Paz por defecto');
            // Ya está en La Paz por defecto
          }
        );
      }
    };

    detectLocation();
  }, [user]);

  // Función para encontrar la ciudad boliviana más cercana
  const findNearestBolivianCity = (lat, lon) => {
    const bolivianCities = {
      'La Paz': { lat: -16.5000, lon: -68.1500 },
      'Santa Cruz': { lat: -17.7833, lon: -63.1821 },
      'Cochabamba': { lat: -17.3895, lon: -66.1568 },
      'Sucre': { lat: -19.0333, lon: -65.2627 },
      'Oruro': { lat: -17.9667, lon: -67.1167 },
      'Tarija': { lat: -21.5355, lon: -64.7296 },
      'Potosí': { lat: -19.5836, lon: -65.7531 },
      'Trinidad': { lat: -14.8333, lon: -64.9000 },
      'Cobija': { lat: -11.0267, lon: -68.7692 }
    };

    let nearestCity = 'La Paz';
    let minDistance = Infinity;

    Object.entries(bolivianCities).forEach(([cityName, coords]) => {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + Math.pow(lon - coords.lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityName;
      }
    });

    return nearestCity;
  };

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

      // Verificar alertas activas (siempre)
      if (user && !weatherData?.isMock) {
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

  // Función para manejar cambio manual de ciudad
  const handleCityChange = async (newCity) => {
    if (newCity === city) return; // No hacer nada si es la misma ciudad

    const oldCity = city;
    setCity(newCity);

    // Esperar a que se actualice el clima y luego guardar
    setTimeout(async () => {
      try {
        const weatherData = await getWeatherData(newCity);
        if (!weatherData?.isMock && user) {
          await addSearchHistory(
            user.id,
            newCity,
            weatherData.main.temp,
            weatherData.weather[0].main
          );
        }
      } catch (error) {
        console.error('Error guardando historial:', error);
      }
    }, 500); // Esperar medio segundo para que cargue el clima
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
          Cargando...
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
                <CitySelector selectedCity={city} onCityChange={handleCityChange} />
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
                Cargando...
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
            Clima Bolivia
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
              {(user.user_metadata?.avatar_url || user.user_metadata?.picture) && (
                <img
                  src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                  alt="Avatar"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid var(--neon-cyan)',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
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
