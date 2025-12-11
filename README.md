# ☁️ Weather App Bolivia

Aplicación web moderna para consultar el clima de las principales ciudades de Bolivia, con diseño dark cyberpunk y funcionalidades avanzadas.

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## ✨ Características

- 🌡️ **Clima en Tiempo Real** - Datos actualizados de OpenWeather API
- 🎨 **Diseño Dark Cyberpunk** - Interfaz moderna con efectos neón
- 🌐 **Bilingüe** - Español e Inglés
- 🔐 **Login con Google** - Autenticación segura obligatoria
- ⭐ **Favoritos** - Guarda tus ciudades favoritas con 1 click
- 📊 **Historial Automático** - Guarda tus últimas 100 búsquedas
- ⚠️ **Alertas Climáticas In-App** - Notificaciones cuando se cumplen condiciones
- ✈️ **Viajes Planificados** - Monitorea el clima de tus próximos destinos
- 👥 **Sistema de Amigos** - Comparte el clima con tus amigos
- 🔔 **Notificaciones Inteligentes** - Alertas en la app cuando el clima cambia
- 📱 **Responsive** - Se adapta perfectamente a móviles y escritorio
- 🎯 **Sistema de Navegación** - Tabs para acceder a todas las funcionalidades

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- API Key de [OpenWeather](https://openweathermap.org/api)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd mario
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo de ejemplo y configura tus credenciales:
```bash
cp .env.example .env
```

Luego edita `.env` con tus valores reales:
```bash
VITE_OPENWEATHER_API_KEY=tu_api_key_aqui
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

⚠️ **Importante:** El archivo `.env` está en `.gitignore` y NO se sube a Git.

4. **Crear tablas en Supabase**

Ve a tu proyecto en Supabase → SQL Editor → Ejecuta el archivo `supabase-schema.sql`

5. **Configurar Google OAuth en Supabase**

- Ve a Authentication → Providers → Google
- Activa Google
- Configura las credenciales OAuth de Google Cloud

6. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── CitySelector.jsx    
│   ├── WeatherCard.jsx     
│   └── Forecast.jsx        
├── services/            # Lógica de negocio
│   ├── weather.js       # API OpenWeather
│   └── supabase.js      # Base de datos
├── context/             # Estado global
│   └── LanguageContext.jsx
├── utils/               
│   └── translations.js  
├── App.jsx              
├── main.jsx             
└── index.css            
```

## 🗄️ Base de Datos

### Tablas

- **favorites** - Ciudades favoritas del usuario
- **search_history** - Historial de búsquedas
- **weather_alerts** - Alertas climáticas configuradas
- **planned_trips** - Viajes planificados
- **friends** - Sistema de amigos

Ver detalles en `NOTAS.md`

## 🔧 Tecnologías

- **Frontend:** React 18 + Vite
- **Estilos:** CSS vanilla con variables CSS
- **Autenticación:** Supabase Auth (Google OAuth)
- **Base de Datos:** Supabase (PostgreSQL)
- **API Clima:** OpenWeather API
- **Íconos:** Lucide React
- **Fuente:** Space Grotesk (Google Fonts)

## 🎨 Paleta de Colores

```css
Fondo principal: #0a0a0f
Cards: #1a1a24
Cyan (Humedad): #00f0ff
Púrpura (Viento): #b537f2
Azul (Presión): #0066ff
```

## 📱 Responsive

- **Desktop (>768px):** Layout centrado, card de 600px
- **Móvil (<768px):** Stack vertical, pronóstico en 3 columnas

## 🔐 Autenticación

El sistema usa Google OAuth a través de Supabase. No se requiere configuración adicional después del setup inicial.

```javascript
import { signInWithGoogle } from './services/supabase';

// Login
await signInWithGoogle();
```


## 📝 Uso

### Consultar Clima
1. Selecciona una ciudad del dropdown
2. Ve el clima actual y pronóstico de 5 días

### Agregar Favorito
1. Inicia sesión con Google
2. Haz clic en el ícono ⭐ en la ciudad
3. Accede rápido desde "Mis Favoritos"

### Crear Alerta
1. Ve a "Alertas"
2. Configura condición (ej: "temp > 30°C")
3. Recibe notificación cuando se cumpla

### Planificar Viaje
1. Ve a "Viajes"
2. Agrega destino y fechas
3. Monitorea el pronóstico automáticamente

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Producción
npm run preview      # Preview de build
npm run lint         # Linter
```


## 👤 Autor

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter)

## 🙏 Agradecimientos

- [OpenWeather](https://openweathermap.org/) por la API
- [Supabase](https://supabase.com) por el backend
- [Lucide](https://lucide.dev/) por los íconos
- [Google Fonts](https://fonts.google.com/) por Space Grotesk

---

⭐ Si te gusta el proyecto, dale una estrella en GitHub!
