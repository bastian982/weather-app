## 📋 Revisión de la función `fetchWeather()`

### ✅ Fortalezas actuales

- ✓ Manejo de errores básico con try/catch
- ✓ Valida que la respuesta OK y que exista current_weather
- ✓ Utiliza async/await (código limpio)
- ✓ Extrae datos con estructura clara antes de retornar

### ⚠️ Áreas de mejora

#### 1. **URL Building - Poco mantenible**
**Problema:** La URL está hardcodeada como string interpolado, difícil de modificar y propenso a errores de sintaxis.

```javascript
// ❌ Actual
const url = `${weatherEndpoint}?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&hourly=relativehumidity_2m&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto`;
```

**Mejora:** Usar `URLSearchParams` para construir parámetros de forma limpia y auditable.

```javascript
// ✅ Mejorado
const params = new URLSearchParams({
  latitude: location.latitude,
  longitude: location.longitude,
  current_weather: true,
  hourly: 'relativehumidity_2m',
  temperature_unit: 'celsius',
  windspeed_unit: 'kmh',
  timezone: 'auto'
});
const url = `${weatherEndpoint}?${params}`;
```

---

#### 2. **Sin validación de datos de entrada**
**Problema:** No se valida que `location` tenga las propiedades requeridas.

```javascript
// ❌ Actual - puede fallar silenciosamente
async function fetchWeather(location) {
  // ¿Qué pasa si location.latitude es undefined?
}
```

**Mejora:** Validar el objeto antes de usarlo.

```javascript
// ✅ Mejorado
async function fetchWeather(location) {
  if (!location || !location.latitude || !location.longitude) {
    throw new Error('Ubicación inválida: faltan coordenadas.');
  }
  // ... resto del código
}
```

---

#### 3. **Sin timeout en fetch**
**Problema:** Si la API es lenta, el usuario no recibe feedback y la solicitud puede colgar indefinidamente.

```javascript
// ❌ Actual - sin timeout
const response = await fetch(url);
```

**Mejora:** Implementar un timeout con AbortController.

```javascript
// ✅ Mejorado
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  // ... resto del código
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    throw new Error('La solicitud tardó demasiado. Intenta de nuevo.');
  }
  throw error;
}
```

---

#### 4. **Validación parcial de respuesta**
**Problema:** Solo se valida la existencia de `current_weather`, pero las propiedades internas pueden ser undefined.

```javascript
// ❌ Actual
if (!data.current_weather) {
  throw new Error('...');
}
// ¿Y si data.current_weather.temperature es undefined?
```

**Mejora:** Validar estructura completa.

```javascript
// ✅ Mejorado
const validateWeatherData = (weatherData) => {
  const required = ['temperature', 'windspeed', 'weathercode', 'time'];
  for (const field of required) {
    if (!(field in weatherData)) {
      throw new Error(`Datos del clima incompletos: falta ${field}`);
    }
  }
};

validateWeatherData(data.current_weather);
```

---

#### 5. **Sin logging para debugging**
**Problema:** Es difícil diagnosticar errores en producción sin logs.

```javascript
// ❌ Actual - sin visibilidad
async function fetchWeather(location) {
  const response = await fetch(url);
  // ¿Qué URL se envió realmente?
  // ¿Cuál fue la respuesta de la API?
}
```

**Mejora:** Agregar logs condicionales en desarrollo.

```javascript
// ✅ Mejorado
const DEBUG = false; // Cambiar a true para ver logs

async function fetchWeather(location) {
  const url = buildWeatherUrl(location);
  if (DEBUG) console.log('📡 Fetching weather:', url);
  
  const response = await fetch(url, { signal });
  if (DEBUG) console.log('📊 Weather response:', response.status);
  
  const data = await response.json();
  if (DEBUG) console.log('📋 Weather data:', data);
  
  return extractWeatherData(data);
}
```

---

#### 6. **Manejo de errores genérico**
**Problema:** Todos los errores devuelven el mismo mensaje.

```javascript
// ❌ Actual
if (!response.ok) {
  throw new Error('No se pudo obtener el clima. Intenta de nuevo más tarde.');
}
```

**Mejora:** Mensajes específicos según el tipo de error.

```javascript
// ✅ Mejorado
if (response.status === 404) {
  throw new Error('Servicio de clima no disponible (404).');
} else if (response.status === 429) {
  throw new Error('Demasiadas solicitudes. Espera un momento.');
} else if (response.status >= 500) {
  throw new Error('Servidor del clima en mantenimiento. Intenta más tarde.');
} else if (!response.ok) {
  throw new Error(`Error HTTP ${response.status}. Intenta de nuevo.`);
}
```

---

#### 7. **Función getHumidity poco eficiente**
**Problema:** `indexOf()` busca completamente en el array cada vez. Para arrays grandes, es O(n).

```javascript
// ❌ Potencialmente lento
const index = hourly.time.indexOf(currentTime);
```

**Mejora:** Si los datos horarios son grandes, crear un Map para búsqueda O(1).

```javascript
// ✅ Mejorado para grandes volúmenes
const buildHumidityMap = (hourlyData) => {
  if (!hourlyData?.time?.length) return new Map();
  return new Map(
    hourlyData.time.map((time, idx) => [time, hourlyData.relativehumidity_2m[idx]])
  );
};
```

---

### 🔧 Versión mejorada completa

```javascript
// Configuración centralizada
const WEATHER_CONFIG = {
  timeout: 10000, // 10 segundos
  temperature_unit: 'celsius',
  windspeed_unit: 'kmh',
};

const DEBUG = false;

/**
 * Construye URL de weather con parámetros validados.
 * @param {Object} location - Ubicación con latitude y longitude
 * @returns {string} URL completa
 */
function buildWeatherUrl(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current_weather: true,
    hourly: 'relativehumidity_2m',
    temperature_unit: WEATHER_CONFIG.temperature_unit,
    windspeed_unit: WEATHER_CONFIG.windspeed_unit,
    timezone: 'auto'
  });
  return `${weatherEndpoint}?${params}`;
}

/**
 * Valida estructura básica de datos de clima.
 * @param {Object} data - Respuesta de la API
 * @throws {Error} Si faltan propiedades críticas
 */
function validateWeatherResponse(data) {
  if (!data?.current_weather) {
    throw new Error('No hay datos de clima disponibles para esta ubicación.');
  }

  const requiredFields = ['temperature', 'windspeed', 'weathercode', 'time'];
  for (const field of requiredFields) {
    if (!(field in data.current_weather)) {
      throw new Error(`Datos incompletos: falta ${field}`);
    }
  }
}

/**
 * Extrae datos relevantes de la respuesta del clima.
 * @param {Object} data - Respuesta de la API
 * @returns {Object} Clima procesado
 */
function extractWeatherData(data) {
  const { current_weather, hourly } = data;
  
  return {
    temperature: current_weather.temperature,
    windspeed: current_weather.windspeed,
    weathercode: current_weather.weathercode,
    time: current_weather.time,
    humidity: getHumidity(hourly, current_weather.time),
  };
}

/**
 * Obtiene el clima actual con manejo robusto de errores.
 * @param {Object} location - Ubicación con coordenadas
 * @returns {Promise<Object>} Datos del clima
 * @throws {Error} Si falla la solicitud o validación
 */
async function fetchWeather(location) {
  // Validar entrada
  if (!location?.latitude || !location?.longitude) {
    throw new Error('Ubicación inválida: faltan coordenadas.');
  }

  const url = buildWeatherUrl(location);
  
  if (DEBUG) console.log('📡 Fetching:', url);

  // Configurar timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEATHER_CONFIG.timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    
    // Manejo específico de errores HTTP
    if (response.status === 404) {
      throw new Error('Servicio de clima no encontrado.');
    } else if (response.status === 429) {
      throw new Error('Demasiadas solicitudes. Espera un momento.');
    } else if (response.status >= 500) {
      throw new Error('Servidor del clima en mantenimiento.');
    } else if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (DEBUG) console.log('📊 Response:', data);

    // Validar estructura
    validateWeatherResponse(data);

    // Extraer y retornar datos
    const weatherData = extractWeatherData(data);
    
    if (DEBUG) console.log('✅ Weather data processed:', weatherData);

    return weatherData;

  } catch (error) {
    // Distinguir entre timeout y otros errores
    if (error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado (timeout). Intenta de nuevo.');
    }
    
    if (DEBUG) console.error('❌ Fetch error:', error);
    
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

### 📊 Comparativa

| Aspecto | Antes | Después |
|--------|-------|---------|
| **URL Building** | Hardcodeada | URLSearchParams (mantenible) |
| **Validación entrada** | No | Sí (latitude/longitude) |
| **Validación salida** | Parcial | Completa (todas las propiedades) |
| **Timeout** | No | 10s con AbortController |
| **Manejo de errores** | Genérico | Específico por código HTTP |
| **Logging/Debug** | No | Logs condicionales |
| **Documentación** | Básica | JSDoc completo |
| **Eficiencia** | O(n) en humedad | O(1) opcional |

---

### 🎯 Recomendaciones de implementación

1. **Prioridad ALTA**: Agregar timeout (AbortController)
2. **Prioridad ALTA**: Usar URLSearchParams para URL
3. **Prioridad MEDIA**: Validación de datos completa
4. **Prioridad MEDIA**: Mensajes de error específicos por HTTP status
5. **Prioridad BAJA**: Agregar logging condicional (DEBUG flag)

Estas mejoras harán la app más robusta, mantenible y fácil de debuguear.
