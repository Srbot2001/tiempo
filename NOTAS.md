# 📝 NOTAS - Weather App Bolivia

## 🗂️ Estructura del Proyecto

```
mario/
├── src/
│   ├── components/          # Componentes visuales
│   │   ├── CitySelector.jsx    → Selector de ciudades
│   │   ├── WeatherCard.jsx     → Tarjeta del clima actual
│   │   └── Forecast.jsx        → Pronóstico de 5 días
│   │
│   ├── services/            # Servicios de datos
│   │   ├── weather.js          → API de OpenWeather
│   │   └── supabase.js         → Base de datos (login, favoritos, etc)
│   │
│   ├── context/             # Estado global
│   │   └── LanguageContext.jsx → Manejo de idiomas (ES/EN)
│   │
│   ├── utils/               # Utilidades
│   │   └── translations.js     → Textos en español/inglés
│   │
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
│
├── .env                     # Variables de entorno (API keys)
└── supabase-schema.sql     # SQL para crear las tablas
```

---

## 🎨 Diseño

### Colores (Dark Cyberpunk)
- **Fondo:** Negro profundo (#0a0a0f)
- **Cards:** Gris oscuro (#1a1a24)
- **Acentos neón:**
  - Cyan: #00f0ff (Humedad)
  - Púrpura: #b537f2 (Viento)
  - Azul: #0066ff (Presión)

### Tipografía
- **Fuente:** Space Grotesk (Google Fonts)
- **Estilo:** Moderna, tech, legible

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

#### 1. `favoritos` - Ubicaciones Favoritas
```
- id (UUID)
- usuario_id (quién la guardó)
- nombre_ciudad (nombre de la ciudad)
- creado_en (cuándo se guardó)
```
**Uso:** Guardar ciudades favoritas del usuario.

---

#### 2. `historial_busquedas` - Historial de Búsquedas
```
- id (UUID)
- usuario_id (quién buscó)
- nombre_ciudad (ciudad buscada)
- temperatura (temperatura en ese momento)
- condicion_clima (clima: lluvia, nublado, etc)
- buscado_en (cuándo buscó)
```
**Uso:** Guardar automáticamente cada consulta (máximo 100 por usuario).

---

#### 3. `alertas_clima` - Alertas Climáticas
```
- id (UUID)
- usuario_id (quién creó la alerta)
- nombre_ciudad (ciudad a monitorear)
- tipo_condicion (tipo: 'temp_mayor', 'temp_menor', 'lluvia', 'viento')
- valor_umbral (valor límite, ej: 30°C)
- esta_activa (activa/desactivada)
```
**Uso:** Mostrar notificaciones en la app cuando se cumplan las condiciones.

**Ejemplo:**
```
Usuario: "Avísame cuando La Paz esté a más de 25°C"
→ tipo_condicion = 'temp_mayor'
→ valor_umbral = 25
→ nombre_ciudad = 'La Paz'
```

---

#### 4. `viajes_planificados` - Viajes Planificados
```
- id (UUID)
- usuario_id (quién va a viajar)
- nombre_ciudad (destino)
- fecha_inicio (fecha de inicio)
- fecha_fin (fecha de fin)
- notas (notas del viaje)
```
**Uso:** Guardar viajes futuros y mostrar el pronóstico de esas fechas.

---

#### 5. `amigos` - Amigos (Compartir)
```
- id (UUID)
- usuario_id (quién envía solicitud)
- amigo_id (a quién se la envía)
- estado ('pendiente', 'aceptada', 'rechazada')
```
**Uso:** Permitir compartir clima entre amigos.

---

## 🔐 Autenticación

### Google OAuth (Login con Google)
1. Usuario hace clic en "Iniciar sesión con Google"
2. Supabase maneja todo el proceso
3. Usuario queda logueado automáticamente
4. Se guarda en `auth.users` (tabla automática de Supabase)

**Función:** `signInWithGoogle()` en `supabase.js`

---

## 🔄 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. Selecciona ciudad
       ▼
┌─────────────────┐
│   App.jsx       │ ← Componente principal
└────┬────────┬───┘
     │        │
     │        │ 2. Llama a weather.js
     │        ▼
     │   ┌────────────────┐
     │   │ OpenWeather API│ → Trae clima actual
     │   └────────────────┘
     │
     │ 3. Guarda en historial
     ▼
┌─────────────────┐
│  Supabase DB    │ → Guarda en search_history
└─────────────────┘
     │
     │ 4. Muestra datos
     ▼
┌─────────────────┐
│  WeatherCard    │ → Muestra temperatura
│  Forecast       │ → Muestra pronóstico
└─────────────────┘
```

---

## 📊 Diagrama de Componentes

```
App (contenedor principal)
├── LanguageContext (idioma ES/EN)
├── CitySelector (dropdown de ciudades)
├── WeatherCard (temperatura actual + stats)
│   ├── Ícono del clima
│   ├── Temperatura grande
│   └── Cards de: Humedad, Viento, Presión
└── Forecast (pronóstico 5 días)
    └── 5 tarjetas con: día, ícono, temp
```

---

## 🔑 Variables de Entorno (.env)

```bash
VITE_OPENWEATHER_API_KEY=tu_api_key_aqui
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

⚠️ **Importante:** Nunca subir `.env` a Git (ya está en `.gitignore`).

---

## 🚀 Cómo Funciona el Sistema

### 1. **Inicio**
- Se carga la app
- Se verifica si hay usuario logueado
- Se muestra La Paz por defecto

### 2. **Consultar Clima**
- Usuario selecciona ciudad
- Se llama a OpenWeather API
- Se obtiene clima actual + pronóstico
- Se guarda búsqueda en `search_history` (si hay usuario)

### 3. **Favoritos**
- Usuario hace clic en "⭐ Agregar a favoritos"
- Se guarda en tabla `favoritos`
- Aparece en lista de favoritos

### 4. **Alertas**
- Usuario crea alerta: "Avísame si llueve en Sucre"
- Se guarda en `alertas_clima`
- Cada vez que consulta Sucre, se verifica si llueve
- Si llueve → muestra notificación en la app

### 5. **Viajes**
- Usuario agrega viaje: "Voy a Tarija del 15 al 20 de enero"
- Se guarda en `viajes_planificados`
- En el dashboard se muestra pronóstico de esas fechas

---

## 🛠️ Funciones Principales (supabase.js)

| Función | Qué Hace |
|---------|----------|
| `signInWithGoogle()` | Login con Google |
| `addFavorite(userId, city)` | Guardar ciudad favorita |
| `getFavorites(userId)` | Obtener favoritos del usuario |
| `addSearchHistory()` | Guardar búsqueda automáticamente |
| `addAlert()` | Crear alerta climática |
| `checkActiveAlerts()` | Verificar si se cumple alguna alerta |
| `addTrip()` | Guardar viaje planificado |
| `getFriends()` | Obtener lista de amigos |

---

## 📱 Responsive

- **Desktop (>768px):** Card centrado, todo visible sin scroll
- **Mobile (<768px):** Stack vertical, pronóstico en 3 columnas

---

## 🎯 Features Implementadas

✅ Consultar clima de ciudades de Bolivia  
✅ **Detección automática de ubicación** (ciudad boliviana más cercana)  
✅ **Idioma:** Solo Español (descripciones del clima en español)  
✅ Tema dark cyberpunk  
✅ **Login con Google** (obligatorio)  
✅ **Favoritos** (guardar ciudades) - CONECTADO  
✅ **Historial de búsquedas** (automático) - CONECTADO  
✅ **Alertas climáticas** (crear, editar, eliminar) - CONECTADO  
✅ **Viajes planificados** (con fechas y notas) - CONECTADO  
✅ **Amigos** (enviar/aceptar solicitudes, ver clima) - CONECTADO  
✅ **Notificaciones in-app** (cuando se cumplen alertas)  
✅ Botón de agregar/quitar favoritos desde dashboard  
✅ Sistema de navegación con tabs  
✅ Responsive (móvil + desktop)  

---

## 🔔 Sistema de Notificaciones

### Notificaciones In-App

Cuando el usuario consulta el clima y tiene alertas activas, la app verifica automáticamente si se cumplen las condiciones:

**Cómo funciona:**
1. Usuario consulta una ciudad (ej: La Paz)
2. La app obtiene el clima actual
3. Busca alertas activas del usuario para esa ciudad
4. Si se cumple la condición → muestra banner flotante

**Ejemplo:**
```
Usuario tiene alerta: "La Paz temperatura > 20°C"
Usuario consulta La Paz: temperatura actual 24°C
→ Aparece notificación: "¡Alerta! La Paz superó los 20°C (actual: 24°C)"
```

**Tipos de alertas soportadas:**
- `temp_mayor`: Temperatura mayor a X°C
- `temp_menor`: Temperatura menor a X°C
- `lluvia`: Cuando llueva
- `viento`: Viento mayor a X m/s

---

## 📊 Flujo de Datos Actualizado

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. Login con Google
       ▼
┌─────────────────┐
│  Supabase Auth  │
└────┬────────────┘
     │
     │ 2. Usuario autenticado
     ▼
┌─────────────────┐
│   Dashboard     │
└────┬────────┬───┘
     │        │
     │        │ 3. Selecciona ciudad + Consulta clima
     │        ▼
     │   ┌────────────────┐
     │   │ OpenWeather API│ → Trae clima actual + pronóstico
     │   └────────┬───────┘
     │            │
     │            ▼
     │   ┌────────────────────────┐
     │   │ Guardar en DB:         │
     │   │ - historial_busquedas  │
     │   └────────────────────────┘
     │            │
     │            ▼
     │   ┌────────────────────────┐
     │   │ Verificar alertas:     │
     │   │ - Si se cumple condición│
     │   │ → Mostrar notificación │
     │   └────────────────────────┘
     │
     │ 4. Navegación a otras vistas
     ▼
┌─────────────────────────────┐
│ - Favoritos                 │
│ - Historial                 │
│ - Alertas (crear/editar)    │
│ - Viajes (planificar)       │
│ - Amigos (compartir clima)  │
└─────────────────────────────┘
```

---

## 👥 Sistema de Amigos

### Cómo Funciona

El sistema de amigos permite **compartir el clima** con tus conocidos y ver dónde están.

**Flujo completo:**

1. **Enviar Solicitud**
   - Usuario ingresa email de su amigo: `amigo@gmail.com`
   - Se crea registro en `amigos`:
     ```
     usuario_id: TU_ID
     amigo_id: ID_DEL_AMIGO
     estado: 'pendiente'
     ```

2. **Recibir Solicitud**
   - El amigo ve la solicitud en su vista de "Amigos"
   - Puede **Aceptar** o **Rechazar**

3. **Aceptar Solicitud**
   - Estado cambia a `'aceptada'`
   - Ambos usuarios ahora son amigos

4. **Ver Amigos**
   - Lista de amigos con su email
   - **Clima de cada amigo** (ubicación: La Paz como ejemplo)
   - Temperatura actual del amigo

**Nota:** Por simplicidad, todos los amigos aparecen en La Paz. En una versión avanzada, cada usuario tendría su ubicación guardada.

### Funciones de Amigos

| Función | Descripción |
|---------|-------------|
| `sendFriendRequest(userId, email)` | Enviar solicitud por email |
| `getPendingRequests(userId)` | Solicitudes pendientes que recibí |
| `acceptFriendRequest(requestId)` | Aceptar solicitud |
| `rejectFriendRequest(requestId)` | Rechazar solicitud |
| `getFriends(userId)` | Lista de amigos aceptados |



---

## 🔒 Seguridad (Row Level Security)

Cada tabla tiene políticas RLS:
- Solo puedes ver TUS datos
- No puedes ver datos de otros usuarios
- Supabase lo maneja automáticamente

**Ejemplo:** Si intentas hacer `SELECT * FROM favorites WHERE user_id != tuId`, Supabase bloquea la consulta.

---

## 📝 Notas Finales

### Para agregar nueva feature:
1. Crear función en `supabase.js`
2. Crear componente visual en `components/`
3. Llamar función desde `App.jsx` o componente

### Para debugear:
- Consola del navegador: `console.log()`
- Supabase Dashboard: ver datos en tiempo real
- Network tab: ver llamadas a API

### Recursos:
- **Supabase Docs:** https://supabase.com/docs
- **OpenWeather API:** https://openweathermap.org/api
- **React Docs:** https://react.dev
