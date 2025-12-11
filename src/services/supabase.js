import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ================================================
// AUTH: LOGIN CON GOOGLE
// ================================================

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// ================================================
// FAVORITOS
// ================================================

export const getFavorites = async (userId) => {
    const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('usuario_id', userId)
        .order('creado_en', { ascending: false });

    if (error) throw error;
    return data;
};

export const addFavorite = async (userId, cityName) => {
    const { data, error } = await supabase
        .from('favoritos')
        .insert([{ usuario_id: userId, nombre_ciudad: cityName }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const removeFavorite = async (favoriteId) => {
    const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('id', favoriteId);

    if (error) throw error;
};

export const isFavorite = async (userId, cityName) => {
    const { data, error } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', userId)
        .eq('nombre_ciudad', cityName)
        .maybeSingle();

    if (error) throw error;
    return data !== null;
};

// ================================================
// HISTORIAL DE BÚSQUEDAS
// ================================================

export const addSearchHistory = async (userId, cityName, temperature, weatherCondition) => {
    const { error } = await supabase
        .from('historial_busquedas')
        .insert([{
            usuario_id: userId,
            nombre_ciudad: cityName,
            temperatura: temperature,
            condicion_clima: weatherCondition
        }]);

    if (error) console.error('Error guardando historial:', error);
    // No lanzamos error para que no afecte la experiencia
};

export const getSearchHistory = async (userId, limit = 20) => {
    const { data, error } = await supabase
        .from('historial_busquedas')
        .select('*')
        .eq('usuario_id', userId)
        .order('buscado_en', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
};

// ================================================
// ALERTAS CLIMÁTICAS
// ================================================

export const getAlerts = async (userId) => {
    const { data, error } = await supabase
        .from('alertas_clima')
        .select('*')
        .eq('usuario_id', userId)
        .eq('esta_activa', true)
        .order('creado_en', { ascending: false });

    if (error) throw error;
    return data;
};

export const addAlert = async (userId, cityName, conditionType, thresholdValue) => {
    const { data, error } = await supabase
        .from('alertas_clima')
        .insert([{
            usuario_id: userId,
            nombre_ciudad: cityName,
            tipo_condicion: conditionType,
            valor_umbral: thresholdValue,
            esta_activa: true
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const toggleAlert = async (alertId, isActive) => {
    const { error } = await supabase
        .from('alertas_clima')
        .update({ esta_activa: isActive })
        .eq('id', alertId);

    if (error) throw error;
};

export const deleteAlert = async (alertId) => {
    const { error } = await supabase
        .from('alertas_clima')
        .delete()
        .eq('id', alertId);

    if (error) throw error;
};

// Verificar si hay alertas activas que se cumplan
export const checkActiveAlerts = async (userId, weatherData) => {
    const alerts = await getAlerts(userId);
    const triggeredAlerts = [];

    alerts.forEach(alert => {
        if (alert.nombre_ciudad !== weatherData.name) return;

        let triggered = false;
        const temp = weatherData.main.temp;

        switch (alert.tipo_condicion) {
            case 'temp_mayor':
                if (temp > alert.valor_umbral) triggered = true;
                break;
            case 'temp_menor':
                if (temp < alert.valor_umbral) triggered = true;
                break;
            case 'lluvia':
                if (weatherData.weather[0].main.toLowerCase().includes('rain')) triggered = true;
                break;
            case 'viento':
                if (weatherData.wind.speed > alert.valor_umbral) triggered = true;
                break;
        }

        if (triggered) triggeredAlerts.push(alert);
    });

    return triggeredAlerts;
};

// ================================================
// VIAJES PLANIFICADOS
// ================================================

export const getPlannedTrips = async (userId) => {
    const { data, error } = await supabase
        .from('viajes_planificados')
        .select('*')
        .eq('usuario_id', userId)
        .gte('fecha_fin', new Date().toISOString().split('T')[0]) // Solo viajes futuros/actuales
        .order('fecha_inicio', { ascending: true });

    if (error) throw error;
    return data;
};

export const addTrip = async (userId, cityName, startDate, endDate, notes = '') => {
    const { data, error } = await supabase
        .from('viajes_planificados')
        .insert([{
            usuario_id: userId,
            nombre_ciudad: cityName,
            fecha_inicio: startDate,
            fecha_fin: endDate,
            notas: notes
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateTrip = async (tripId, updates) => {
    const { error } = await supabase
        .from('viajes_planificados')
        .update(updates)
        .eq('id', tripId);

    if (error) throw error;
};

export const deleteTrip = async (tripId) => {
    const { error } = await supabase
        .from('viajes_planificados')
        .delete()
        .eq('id', tripId);

    if (error) throw error;
};

// ================================================
// AMIGOS / COMPARTIR
// ================================================

export const sendFriendRequest = async (userId, friendEmail) => {
    // Buscar el usuario por email usando función SQL
    const { data: users, error: searchError } = await supabase
        .rpc('buscar_usuario_por_email', { p_email: friendEmail });
    
    if (searchError || !users || users.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    const friendId = users[0].id_usuario;

    // Verificar que no sea el mismo usuario
    if (friendId === userId) {
        throw new Error('No puedes agregarte a ti mismo');
    }

    const { data, error } = await supabase
        .from('amigos')
        .insert([{
            usuario_id: userId,
            amigo_id: friendId,
            estado: 'pendiente'
        }])
        .select()
        .single();
    
    if (error) {
        // Error de duplicado (ya existe solicitud)
        if (error.code === '23505') {
            throw new Error('Ya enviaste una solicitud a este usuario');
        }
        throw error;
    }
    return data;
};

export const acceptFriendRequest = async (requestId) => {
    const { error } = await supabase
        .from('amigos')
        .update({ estado: 'aceptada' })
        .eq('id', requestId);

    if (error) throw error;
};

export const rejectFriendRequest = async (requestId) => {
    const { error } = await supabase
        .from('amigos')
        .update({ estado: 'rechazada' })
        .eq('id', requestId);

    if (error) throw error;
};

export const getFriends = async (userId) => {
    const { data, error } = await supabase
        .rpc('obtener_amigos_aceptados', { p_usuario_id: userId });

    if (error) throw error;
    return data;
};

export const getPendingRequests = async (userId) => {
    const { data, error } = await supabase
        .from('amigos')
        .select('*')
        .eq('amigo_id', userId)
        .eq('estado', 'pendiente');

    if (error) throw error;
    return data;
};
