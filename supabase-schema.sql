-- ================================================
-- ESQUEMA PARA WEATHER APP - SUPABASE
-- ================================================
-- Ejecuta este script en el Editor SQL de Supabase
-- ================================================

-- 1. UBICACIONES FAVORITAS
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_ciudad VARCHAR(100) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados: un usuario no puede tener la misma ciudad dos veces
  UNIQUE(usuario_id, nombre_ciudad)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_id ON favoritos(usuario_id);

COMMENT ON TABLE favoritos IS 'Ciudades favoritas de cada usuario';
COMMENT ON COLUMN favoritos.usuario_id IS 'Usuario dueño del favorito';
COMMENT ON COLUMN favoritos.nombre_ciudad IS 'Nombre de la ciudad favorita';

-- ================================================

-- 2. HISTORIAL DE BÚSQUEDAS
CREATE TABLE IF NOT EXISTS historial_busquedas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_ciudad VARCHAR(100) NOT NULL,
  temperatura DECIMAL(5,2),
  condicion_clima VARCHAR(100),
  buscado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_historial_usuario_id ON historial_busquedas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_buscado_en ON historial_busquedas(buscado_en DESC);

COMMENT ON TABLE historial_busquedas IS 'Historial de consultas de clima (máximo 100 por usuario)';
COMMENT ON COLUMN historial_busquedas.temperatura IS 'Temperatura al momento de la consulta';
COMMENT ON COLUMN historial_busquedas.condicion_clima IS 'Condición climática (ej: nublado, lluvia)';

-- ================================================

-- 3. ALERTAS CLIMÁTICAS (MOSTRAR EN APP, SIN NOTIFICACIONES EXTERNAS)
CREATE TABLE IF NOT EXISTS alertas_clima (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_ciudad VARCHAR(100) NOT NULL,
  tipo_condicion VARCHAR(50) NOT NULL, -- 'temp_mayor', 'temp_menor', 'lluvia', 'viento'
  valor_umbral DECIMAL(5,2), -- Ej: 30 para temperatura
  esta_activa BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validación: tipo de condición debe ser uno de estos
  CONSTRAINT tipo_condicion_valido CHECK (
    tipo_condicion IN ('temp_mayor', 'temp_menor', 'lluvia', 'viento')
  )
);

CREATE INDEX IF NOT EXISTS idx_alertas_usuario_id ON alertas_clima(usuario_id);
CREATE INDEX IF NOT EXISTS idx_alertas_activa ON alertas_clima(esta_activa) WHERE esta_activa = TRUE;

COMMENT ON TABLE alertas_clima IS 'Alertas climáticas configuradas por el usuario';
COMMENT ON COLUMN alertas_clima.tipo_condicion IS 'Tipo: temp_mayor=temperatura mayor, temp_menor=temperatura menor, lluvia=lluvia, viento=viento fuerte';
COMMENT ON COLUMN alertas_clima.valor_umbral IS 'Valor umbral (ej: 30 grados, 50 km/h)';
COMMENT ON COLUMN alertas_clima.esta_activa IS 'Si la alerta está activa o pausada';

-- ================================================

-- 4. VIAJES PLANIFICADOS
CREATE TABLE IF NOT EXISTS viajes_planificados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_ciudad VARCHAR(100) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validación: fecha fin debe ser después de fecha inicio
  CONSTRAINT rango_fechas_valido CHECK (fecha_fin >= fecha_inicio)
);

CREATE INDEX IF NOT EXISTS idx_viajes_usuario_id ON viajes_planificados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_viajes_fechas ON viajes_planificados(fecha_inicio, fecha_fin);

COMMENT ON TABLE viajes_planificados IS 'Viajes planificados para monitorear el clima del destino';
COMMENT ON COLUMN viajes_planificados.fecha_inicio IS 'Fecha de inicio del viaje';
COMMENT ON COLUMN viajes_planificados.fecha_fin IS 'Fecha de fin del viaje';
COMMENT ON COLUMN viajes_planificados.notas IS 'Notas personales sobre el viaje';

-- ================================================

-- 5. AMIGOS / COMPARTIR CLIMA
CREATE TABLE IF NOT EXISTS amigos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amigo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aceptada', 'rechazada'
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados y auto-amistad
  CONSTRAINT no_auto_amistad CHECK (usuario_id != amigo_id),
  UNIQUE(usuario_id, amigo_id),
  
  -- Validación: estado debe ser válido
  CONSTRAINT estado_valido CHECK (estado IN ('pendiente', 'aceptada', 'rechazada'))
);

CREATE INDEX IF NOT EXISTS idx_amigos_usuario_id ON amigos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_amigos_estado ON amigos(estado);

COMMENT ON TABLE amigos IS 'Relaciones de amistad para compartir ubicaciones y clima';
COMMENT ON COLUMN amigos.estado IS 'pendiente=pendiente, aceptada=aceptada, rechazada=rechazada';

-- ================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- ================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_busquedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_clima ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes_planificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE amigos ENABLE ROW LEVEL SECURITY;

-- FAVORITOS: Solo ver/editar los propios
CREATE POLICY "Los usuarios pueden ver sus propios favoritos" 
  ON favoritos FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden agregar sus propios favoritos" 
  ON favoritos FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios favoritos" 
  ON favoritos FOR DELETE 
  USING (auth.uid() = usuario_id);

-- HISTORIAL: Solo ver el propio
CREATE POLICY "Los usuarios pueden ver su propio historial" 
  ON historial_busquedas FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden agregar a su propio historial" 
  ON historial_busquedas FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

-- ALERTAS: Solo ver/editar las propias
CREATE POLICY "Los usuarios pueden ver sus propias alertas" 
  ON alertas_clima FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden gestionar sus propias alertas" 
  ON alertas_clima FOR ALL 
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- VIAJES: Solo ver/editar los propios
CREATE POLICY "Los usuarios pueden ver sus propios viajes" 
  ON viajes_planificados FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden gestionar sus propios viajes" 
  ON viajes_planificados FOR ALL 
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- AMIGOS: Ver solicitudes recibidas y enviadas
CREATE POLICY "Los usuarios pueden ver sus solicitudes de amistad" 
  ON amigos FOR SELECT 
  USING (auth.uid() = usuario_id OR auth.uid() = amigo_id);

CREATE POLICY "Los usuarios pueden enviar solicitudes de amistad" 
  ON amigos FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar solicitudes recibidas" 
  ON amigos FOR UPDATE 
  USING (auth.uid() = amigo_id);

-- ================================================
-- FUNCIONES ÚTILES
-- ================================================

-- Eliminar función anterior si existe (para evitar conflictos)
DROP FUNCTION IF EXISTS obtener_amigos_aceptados(UUID);
DROP FUNCTION IF EXISTS get_accepted_friends(UUID);

-- Función para obtener amigos aceptados
CREATE OR REPLACE FUNCTION obtener_amigos_aceptados(p_usuario_id UUID)
RETURNS TABLE (
  id_amigo UUID,
  email_amigo TEXT,
  desde TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN a.usuario_id = p_usuario_id THEN a.amigo_id
      ELSE a.usuario_id
    END as id_amigo,
    u.email::TEXT as email_amigo,
    a.creado_en as desde
  FROM amigos a
  JOIN auth.users u ON (
    u.id = CASE 
      WHEN a.usuario_id = p_usuario_id THEN a.amigo_id
      ELSE a.usuario_id
    END
  )
  WHERE (a.usuario_id = p_usuario_id OR a.amigo_id = p_usuario_id)
    AND a.estado = 'aceptada';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION obtener_amigos_aceptados IS 'Devuelve la lista de amigos aceptados de un usuario';

-- Función para buscar usuario por email (para solicitudes de amistad)
CREATE OR REPLACE FUNCTION buscar_usuario_por_email(p_email TEXT)
RETURNS TABLE (
  id_usuario UUID,
  email_usuario TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id as id_usuario,
    email::TEXT as email_usuario
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION buscar_usuario_por_email IS 'Busca un usuario por su email para enviar solicitudes de amistad';


-- ================================================
-- TRIGGERS (DISPARADORES)
-- ================================================

-- Trigger: Limitar historial a últimos 100 registros por usuario
CREATE OR REPLACE FUNCTION limitar_historial_busquedas()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM historial_busquedas
  WHERE id IN (
    SELECT id FROM historial_busquedas
    WHERE usuario_id = NEW.usuario_id
    ORDER BY buscado_en DESC
    OFFSET 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_limitar_historial
  AFTER INSERT ON historial_busquedas
  FOR EACH ROW
  EXECUTE FUNCTION limitar_historial_busquedas();

COMMENT ON FUNCTION limitar_historial_busquedas IS 'Mantiene solo los últimos 100 registros de historial por usuario';

-- ================================================
-- FIN DEL ESQUEMA
-- ================================================

-- 🎉 ¡Tablas creadas exitosamente!
-- 
-- RESUMEN DE TABLAS CREADAS:
-- 
-- 📌 favoritos
--    - id (UUID)
--    - usuario_id (UUID)
--    - nombre_ciudad (texto)
--    - creado_en (fecha y hora)
--
-- 📌 historial_busquedas
--    - id (UUID)
--    - usuario_id (UUID)
--    - nombre_ciudad (texto)
--    - temperatura (número decimal)
--    - condicion_clima (texto)
--    - buscado_en (fecha y hora)
--
-- 📌 alertas_clima
--    - id (UUID)
--    - usuario_id (UUID)
--    - nombre_ciudad (texto)
--    - tipo_condicion ('temp_mayor', 'temp_menor', 'lluvia', 'viento')
--    - valor_umbral (número)
--    - esta_activa (verdadero/falso)
--    - creado_en (fecha y hora)
--
-- 📌 viajes_planificados
--    - id (UUID)
--    - usuario_id (UUID)
--    - nombre_ciudad (texto)
--    - fecha_inicio (fecha)
--    - fecha_fin (fecha)
--    - notas (texto largo)
--    - creado_en (fecha y hora)
--
-- 📌 amigos
--    - id (UUID)
--    - usuario_id (UUID)
--    - amigo_id (UUID)
--    - estado ('pendiente', 'aceptada', 'rechazada')
--    - creado_en (fecha y hora)
--
-- Próximos pasos:
-- 1. Ve a Authentication > Providers y activa Google OAuth
-- 2. Configura las credenciales de Google Cloud
-- 3. ¡Listo para usar!
