// ============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================

/**
 * Configuración de la aplicación del clima
 */
const WEATHER_CONFIG = {
  timeout: 10000, // 10 segundos
  temperature_unit: 'celsius',
  windspeed_unit: 'kmh',
};

/**
 * Endpoints de la API de Open-Meteo
 */
const API_ENDPOINTS = {
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  weather: 'https://api.open-meteo.com/v1/forecast',
};

/**
 * Modo debug para desarrollo
 */
const DEBUG = false;

// ============================================
// SISTEMA DE CACHE MULTIPLATAFORMA
// ============================================

/**
 * Duración del caché en milisegundos (1 hora = 3600000ms)
 */
const CACHE_DURATION = 3600000; // 1 hora

/**
 * Detecta si estamos en un entorno con localStorage disponible.
 * 
 * @returns {boolean} true si localStorage está disponible
 */
function hasLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    // Probar que localStorage funciona
    const testKey = '__cache_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Almacén de caché multiplataforma.
 * Usa localStorage en navegador, Map en memoria en Node.js.
 */
const cacheStorage = (() => {
  if (hasLocalStorage()) {
    return {
      get: (key) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (error) {
          console.warn('Error leyendo de localStorage:', error);
          return null;
        }
      },
      set: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.warn('Error escribiendo en localStorage:', error);
        }
      },
      remove: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Error eliminando de localStorage:', error);
        }
      },
      clear: () => {
        try {
          localStorage.clear();
        } catch (error) {
          console.warn('Error limpiando localStorage:', error);
        }
      }
    };
  } else {
    // Fallback para Node.js o entornos sin localStorage
    const memoryCache = new Map();
    return {
      get: (key) => memoryCache.get(key) || null,
      set: (key, value) => memoryCache.set(key, value),
      remove: (key) => memoryCache.delete(key),
      clear: () => memoryCache.clear()
    };
  }
})();

/**
 * Verifica si los datos en caché son válidos (menos de 1 hora de antigüedad).
 * 
 * @param {Object} cachedData - Datos en caché con timestamp
 * @param {number} cachedData.timestamp - Timestamp cuando se guardó
 * @returns {boolean} true si los datos son válidos
 */
function isCacheValid(cachedData) {
  if (!cachedData || !cachedData.timestamp) {
    return false;
  }

  const now = Date.now();
  const age = now - cachedData.timestamp;

  return age < CACHE_DURATION;
}

/**
 * Genera una clave única para el caché basada en ubicación.
 * 
 * @param {Object} location - Ubicación con latitude y longitude
 * @returns {string} Clave única para caché (ej: "weather_40.4168_-3.7038")
 */
function generateCacheKey(location) {
  if (!location?.latitude || !location?.longitude) {
    throw new Error('Ubicación inválida para generar clave de caché');
  }

  // Redondear a 4 decimales para evitar variaciones mínimas
  const lat = Math.round(location.latitude * 10000) / 10000;
  const lon = Math.round(location.longitude * 10000) / 10000;

  return `weather_${lat}_${lon}`;
}

/**
 * Obtiene datos del clima desde el caché si son válidos.
 * 
 * @param {Object} location - Ubicación con coordenadas
 * @returns {Object|null} Datos del clima en caché o null si expiró/no existe
 * 
 * @example
 * const location = { latitude: 40.4168, longitude: -3.7038 };
 * const cachedWeather = getCachedWeather(location);
 * if (cachedWeather) {
 *   console.log('Usando datos en caché:', cachedWeather.temperature);
 * } else {
 *   console.log('No hay caché válido, consultando API...');
 * }
 */
function getCachedWeather(location) {
  try {
    const cacheKey = generateCacheKey(location);
    const cachedData = cacheStorage.get(cacheKey);

    if (!cachedData) {
      if (DEBUG) console.log('📭 No hay datos en caché para:', cacheKey);
      return null;
    }

    if (!isCacheValid(cachedData)) {
      if (DEBUG) console.log('⏰ Datos en caché expirados para:', cacheKey);
      // Limpiar caché expirado
      cacheStorage.remove(cacheKey);
      return null;
    }

    if (DEBUG) {
      const age = Math.round((Date.now() - cachedData.timestamp) / 1000);
      console.log(`✅ Usando caché (${age}s antigüedad):`, cacheKey);
    }

    return cachedData.weather;
  } catch (error) {
    console.warn('Error obteniendo datos del caché:', error);
    return null;
  }
}

/**
 * Almacena datos del clima en el caché con timestamp.
 * 
 * @param {Object} location - Ubicación con coordenadas
 * @param {Object} weatherData - Datos del clima a almacenar
 * @returns {boolean} true si se guardó exitosamente
 * 
 * @example
 * const location = { latitude: 40.4168, longitude: -3.7038 };
 * const weather = await fetchWeather(location);
 * const saved = setCachedWeather(location, weather);
 * console.log(saved ? 'Guardado en caché' : 'Error guardando');
 */
function setCachedWeather(location, weatherData) {
  try {
    if (!weatherData || typeof weatherData !== 'object') {
      console.warn('Datos de clima inválidos para caché');
      return false;
    }

    const cacheKey = generateCacheKey(location);
    const cacheEntry = {
      weather: weatherData,
      timestamp: Date.now(),
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        country: location.country
      }
    };

    cacheStorage.set(cacheKey, cacheEntry);

    if (DEBUG) {
      const expiresAt = new Date(cacheEntry.timestamp + CACHE_DURATION);
      console.log(`💾 Datos guardados en caché: ${cacheKey} (expira: ${expiresAt.toLocaleTimeString()})`);
    }

    return true;
  } catch (error) {
    console.warn('Error guardando en caché:', error);
    return false;
  }
}

/**
 * Limpia todo el caché de clima.
 * Útil para testing o cuando el usuario quiere forzar actualización.
 * 
 * @returns {boolean} true si se limpió exitosamente
 */
function clearWeatherCache() {
  try {
    cacheStorage.clear();
    if (DEBUG) console.log('🗑️ Caché de clima limpiado');
    return true;
  } catch (error) {
    console.warn('Error limpiando caché:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas del caché (número de entradas, espacio usado, etc.).
 * Solo funciona en navegador con localStorage.
 * 
 * @returns {Object} Estadísticas del caché
 */
function getCacheStats() {
  try {
    if (!hasLocalStorage()) {
      return { available: false, message: 'Estadísticas solo disponibles en navegador' };
    }

    let entries = 0;
    let totalSize = 0;
    let expiredEntries = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('weather_')) {
        entries++;
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // Aproximado en bytes

        try {
          const data = JSON.parse(value);
          if (!isCacheValid(data)) {
            expiredEntries++;
          }
        } catch (error) {
          // Entrada corrupta
          expiredEntries++;
        }
      }
    }

    return {
      available: true,
      entries,
      expiredEntries,
      validEntries: entries - expiredEntries,
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
    };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

// ============================================
// SISTEMA DE PRONÓSTICO DE 5 DÍAS
// ============================================

/**
 * Construye URL para obtener pronóstico diario de 5 días.
 * 
 * @param {Object} location - Ubicación con latitude y longitude
 * @returns {string} URL completa para pronóstico
 * @throws {Error} Si faltan coordenadas
 */
function buildForecastUrl(location) {
  if (!location?.latitude || !location?.longitude) {
    throw new Error('Ubicación inválida: faltan coordenadas.');
  }

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    daily: 'temperature_2m_max,temperature_2m_min,weathercode',
    forecast_days: 5,
    timezone: 'auto',
  });

  return `${API_ENDPOINTS.weather}?${params}`;
}

/**
 * Obtiene el pronóstico del tiempo de 5 días con caché.
 * 
 * @param {Object} location - Ubicación con coordenadas
 * @returns {Promise<Object>} Pronóstico procesado con datos diarios
 * @throws {Error} Si falla la consulta o validación
 */
async function fetchWeatherForecast(location) {
  // Validar entrada
  if (!location?.latitude || !location?.longitude) {
    throw new Error('Ubicación inválida: faltan coordenadas.');
  }

  // Verificar caché primero
  const cacheKey = `forecast_${generateCacheKey(location)}`;
  const cachedData = cacheStorage.get(cacheKey);

  if (cachedData && isCacheValid(cachedData)) {
    if (DEBUG) console.log('📭 Usando pronóstico del caché');
    return cachedData.forecast;
  }

  // Consultar API si no hay caché válido
  const url = buildForecastUrl(location);

  if (DEBUG) console.log('📡 Consultando pronóstico:', url);

  // Configurar timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEATHER_CONFIG.timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });

    // Manejo de errores HTTP
    if (response.status === 404) {
      throw new Error('Servicio de pronóstico no encontrado.');
    } else if (response.status === 429) {
      throw new Error('Demasiadas solicitudes. Espera un momento.');
    } else if (response.status >= 500) {
      throw new Error('Servidor del pronóstico en mantenimiento.');
    } else if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}. No se pudo obtener el pronóstico.`);
    }

    const data = await response.json();

    if (DEBUG) console.log('📊 Respuesta del pronóstico:', data);

    // Validar respuesta
    if (!data?.daily) {
      throw new Error('Datos de pronóstico no disponibles.');
    }

    // Procesar datos diarios
    const forecast = processForecastData(data.daily);

    // Guardar en caché
    const cacheEntry = {
      forecast,
      timestamp: Date.now(),
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      }
    };
    cacheStorage.set(cacheKey, cacheEntry);

    if (DEBUG) console.log('✅ Pronóstico obtenido y guardado en caché');

    return forecast;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`La solicitud del pronóstico tardó demasiado (>${WEATHER_CONFIG.timeout}ms).`);
    }

    if (DEBUG) console.error('❌ Error obteniendo pronóstico:', error);

    throw error;

  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Procesa los datos diarios crudos de la API en un formato usable.
 * 
 * @param {Object} dailyData - Datos diarios de la API
 * @returns {Array} Array de objetos con pronóstico diario
 */
function processForecastData(dailyData) {
  if (!dailyData?.time || !dailyData?.temperature_2m_max ||
      !dailyData?.temperature_2m_min || !dailyData?.weathercode) {
    return [];
  }

  return dailyData.time.map((date, index) => {
    const weatherInfo = weatherCodeMap[dailyData.weathercode[index]] || {
      text: 'Condiciones desconocidas',
      icon: 'fas fa-cloud',
    };

    return {
      date,
      dayName: formatDayName(date),
      tempMax: dailyData.temperature_2m_max[index],
      tempMin: dailyData.temperature_2m_min[index],
      weathercode: dailyData.weathercode[index],
      condition: weatherInfo.text,
      icon: weatherInfo.icon,
    };
  });
}

/**
 * Formatea una fecha ISO a nombre del día de la semana.
 * 
 * @param {string} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} Nombre del día (ej: "Lunes", "Hoy", "Mañana")
 */
function formatDayName(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Comparar solo fecha (ignorar hora)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Hoy';
  } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Mañana';
  } else {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  }
}

/**
 * Muestra el pronóstico de 5 días en la interfaz de usuario.
 * 
 * @param {Array} forecast - Array con datos del pronóstico diario
 */
function displayWeatherForecast(forecast) {
  if (!forecast || !Array.isArray(forecast) || forecast.length === 0) {
    if (DEBUG) console.warn('⚠️ No hay datos de pronóstico para mostrar');
    forecastContainer.classList.add('hidden');
    return;
  }

  // Limpiar pronóstico anterior
  forecastGrid.innerHTML = '';

  // Crear elementos para cada día con DOM seguro
  forecast.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'forecast-day';

    const dayName = document.createElement('div');
    dayName.className = 'forecast-day-name';
    dayName.textContent = day.dayName;

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'forecast-icon';
    const iconElement = document.createElement('i');
    iconElement.className = day.icon;
    iconWrapper.appendChild(iconElement);

    const tempWrapper = document.createElement('div');
    tempWrapper.className = 'forecast-temp';
    const tempMax = document.createElement('span');
    tempMax.className = 'forecast-temp-max';
    tempMax.textContent = `${Math.round(day.tempMax)}°`;
    const tempMin = document.createElement('span');
    tempMin.className = 'forecast-temp-min';
    tempMin.textContent = `${Math.round(day.tempMin)}°`;
    tempWrapper.appendChild(tempMax);
    tempWrapper.appendChild(tempMin);

    const condition = document.createElement('div');
    condition.className = 'forecast-condition';
    condition.textContent = day.condition;

    dayElement.appendChild(dayName);
    dayElement.appendChild(iconWrapper);
    dayElement.appendChild(tempWrapper);
    dayElement.appendChild(condition);

    forecastGrid.appendChild(dayElement);
  });

  forecastContainer.classList.remove('hidden');

  if (DEBUG) console.log(`✅ Pronóstico de ${forecast.length} días mostrado`);
}

/**
 * Oculta el contenedor del pronóstico.
 */
function hideWeatherForecast() {
  forecastContainer.classList.add('hidden');
  forecastGrid.innerHTML = '';
}

let currentLocation = null;
let currentForecast = null;
let isForecastVisible = false;
let isForecastLoading = false;

const HISTORY_STORAGE_KEY = 'weather_search_history';

function resetForecastState() {
  currentForecast = null;
  isForecastVisible = false;
  isForecastLoading = false;
  if (toggleForecastButton) {
    toggleForecastButton.textContent = 'Ver pronóstico 5 días';
    toggleForecastButton.disabled = false;
  }
}

function loadSearchHistory() {
  if (!hasLocalStorage()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Error cargando historial de búsqueda:', error);
    return [];
  }
}

function saveSearchHistory(history) {
  if (!hasLocalStorage()) {
    return;
  }

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Error guardando historial de búsqueda:', error);
  }
}

function addSearchToHistory(location) {
  if (!location?.name || !location?.country) {
    return;
  }

  const entry = {
    city: location.name,
    country: location.country,
    timestamp: Date.now(),
  };

  const history = loadSearchHistory();
  const existingIndex = history.findIndex(item =>
    item.city.toLowerCase() === entry.city.toLowerCase() &&
    item.country.toLowerCase() === entry.country.toLowerCase()
  );

  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }

  history.unshift(entry);
  if (history.length > 10) {
    history.splice(10);
  }

  saveSearchHistory(history);
  renderSearchHistory();
}

function clearSearchHistory() {
  if (!hasLocalStorage()) {
    return;
  }

  localStorage.removeItem(HISTORY_STORAGE_KEY);
  renderSearchHistory();
}

function renderSearchHistory() {
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const clearHistoryButton = document.getElementById('clearHistoryButton');
  const history = loadSearchHistory();

  if (!historyPanel || !historyList || !clearHistoryButton) {
    return;
  }

  if (!history.length) {
    historyPanel.classList.add('hidden');
    historyList.innerHTML = '';
    clearHistoryButton.classList.add('hidden');
    return;
  }

  historyPanel.classList.remove('hidden');
  clearHistoryButton.classList.remove('hidden');
  historyList.innerHTML = '';

  history.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.className = 'history-item';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'history-entry';
    button.innerHTML = `<span>${item.city}, ${item.country}</span>`;
    button.addEventListener('click', () => {
      if (cityInput && countryInput) {
        cityInput.value = item.city;
        countryInput.value = item.country;
      }
      searchForm.requestSubmit();
    });

    listItem.appendChild(button);
    historyList.appendChild(listItem);
  });
}

async function handleToggleForecast() {
  if (!currentLocation || !toggleForecastButton) {
    return;
  }

  if (isForecastVisible) {
    hideWeatherForecast();
    isForecastVisible = false;
    toggleForecastButton.textContent = 'Ver pronóstico 5 días';
    return;
  }

  if (isForecastLoading) {
    return;
  }

  if (currentForecast) {
    displayWeatherForecast(currentForecast);
    isForecastVisible = true;
    toggleForecastButton.textContent = 'Ocultar pronóstico 5 días';
    return;
  }

  isForecastLoading = true;
  toggleForecastButton.disabled = true;
  toggleForecastButton.textContent = 'Cargando pronóstico...';

  try {
    const forecast = await fetchWeatherForecast(currentLocation);
    currentForecast = forecast;

    displayWeatherForecast(forecast);
    isForecastVisible = true;
    toggleForecastButton.textContent = 'Ocultar pronóstico 5 días';
  } catch (error) {
    showError(error.message);
  } finally {
    isForecastLoading = false;
    if (toggleForecastButton) {
      toggleForecastButton.disabled = false;
    }
  }
}

function handleBackToSearch() {
  resetDisplay();
  currentLocation = null;
  resetForecastState();

  if (searchScreen) {
    searchScreen.classList.remove('hidden');
  }

  if (cityInput) {
    cityInput.focus();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const countryInput = document.getElementById('countryInput');
const searchScreen = document.getElementById('searchScreen');
const weatherContainer = document.getElementById('weatherContainer');
const forecastContainer = document.getElementById('forecastContainer');
const forecastGrid = document.getElementById('forecastGrid');
const errorMessage = document.getElementById('errorMessage');
const locationName = document.getElementById('locationName');
const weatherDescription = document.getElementById('weatherDescription');
const weatherIcon = document.getElementById('weatherIcon');
const temperatureC = document.getElementById('temperatureC');
const temperatureF = document.getElementById('temperatureF');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const localTime = document.getElementById('localTime');
const toggleForecastButton = document.getElementById('toggleForecastButton');
const backButton = document.getElementById('backButton');

if (toggleForecastButton) {
  toggleForecastButton.addEventListener('click', handleToggleForecast);
}

if (backButton) {
  backButton.addEventListener('click', handleBackToSearch);
}

const clearHistoryButton = document.getElementById('clearHistoryButton');
if (clearHistoryButton) {
  clearHistoryButton.addEventListener('click', clearSearchHistory);
}

renderSearchHistory();

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  const country = countryInput.value.trim();

  if (!city || !country) {
    showError('Debes ingresar ciudad y país.');
    return;
  }

  resetDisplay();
  resetForecastState();

  try {
    // Buscar ubicación
    const location = await searchLocation(city, country);
    currentLocation = location;

    // Obtener sólo el clima actual para evitar scroll adicional inmediato
    const weather = await fetchWeather(location);

    // Mostrar resultados
    displayWeather(location, weather);
    addSearchToHistory(location);

    if (searchScreen) {
      searchScreen.classList.add('hidden');
    }
  } catch (error) {
    showError(error.message);
  }
});

/**
 * Busca la ciudad en la API de geocodificación de Open-Meteo.
 * Valida que la ciudad y el país coincidan.
 * 
 * @param {string} city - Nombre de la ciudad
 * @param {string} country - Nombre o código del país
 * @returns {Promise<Object>} Objeto de ubicación con coordenadas
 * @throws {Error} Si la ciudad o país no se encuentran
 */
async function searchLocation(city, country) {
  const params = new URLSearchParams({
    name: city,
    count: 10,
    language: 'es',
  });
  const url = `${API_ENDPOINTS.geocoding}?${params}`;
  
  if (DEBUG) console.log('🔍 Buscando ubicación:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('No se pudo consultar la geocodificación. Intenta de nuevo más tarde.');
  }

  const data = await response.json();
  
  if (DEBUG) console.log('📍 Resultados de geocodificación:', data.results);

  if (!data.results || data.results.length === 0) {
    throw new Error('No se encontró la ciudad indicada. Verifica el nombre.');
  }

  const normalizedCountry = normalizeText(country);
  const match = data.results.find((location) => {
    const locationCountry = normalizeText(location.country || '');
    const locationCode = normalizeText(location.country_code || '');

    return (
      locationCountry === normalizedCountry ||
      locationCode === normalizedCountry ||
      locationCountry.includes(normalizedCountry) ||
      normalizedCountry.includes(locationCountry)
    );
  });

  if (!match) {
    throw new Error('La ciudad y el país no coinciden o no existen. Verifica ambos valores.');
  }

  if (DEBUG) console.log('✅ Ubicación encontrada:', match);

  return match;
}

/**
 * Construye URL de weather con parámetros validados y centralizados.
 * 
 * @param {Object} location - Ubicación con latitude y longitude
 * @returns {string} URL completa con parámetros
 * @throws {Error} Si faltan coordenadas
 */
function buildWeatherUrl(location) {
  if (!location?.latitude || !location?.longitude) {
    throw new Error('Ubicación inválida: faltan coordenadas.');
  }

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current_weather: true,
    hourly: 'relativehumidity_2m',
    temperature_unit: WEATHER_CONFIG.temperature_unit,
    windspeed_unit: WEATHER_CONFIG.windspeed_unit,
    timezone: 'auto',
  });

  return `${API_ENDPOINTS.weather}?${params}`;
}

/**
 * Valida que la respuesta de la API tenga estructura completa.
 * 
 * @param {Object} data - Respuesta de la API de clima
 * @throws {Error} Si faltan datos críticos
 */
function validateWeatherResponse(data) {
  if (!data?.current_weather) {
    throw new Error('No hay datos de clima disponibles para esta ubicación.');
  }

  const requiredFields = ['temperature', 'windspeed', 'weathercode', 'time'];
  for (const field of requiredFields) {
    if (!(field in data.current_weather)) {
      throw new Error(`Datos incompletos del clima: falta ${field}`);
    }
  }

  if (DEBUG) console.log('✓ Validación de respuesta exitosa');
}

/**
 * Extrae datos relevantes de la respuesta del clima API.
 * 
 * @param {Object} data - Respuesta completa de la API
 * @returns {Object} Objeto con datos climatológicos procesados
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
 * Obtiene el clima actual de una ubicación con manejo robusto de errores, timeout y caché.
 * 
 * Esta función primero verifica si hay datos en caché válidos (menos de 1 hora).
 * Si los hay, los retorna inmediatamente. Si no, consulta la API de Open-Meteo,
 * valida la respuesta, extrae los datos y los guarda en caché para futuras consultas.
 * 
 * Incluye validación de entrada, timeout automático de 10 segundos y manejo
 * específico de errores HTTP. Es multiplataforma (funciona en navegador y Node.js).
 * 
 * @async
 * @param {Object} location - Ubicación con coordenadas geográficas
 * @param {number} location.latitude - Latitud en formato decimal (ej: 40.4168)
 * @param {number} location.longitude - Longitud en formato decimal (ej: -3.7038)
 * @param {string} [location.name] - Nombre de la ciudad (opcional, para debugging)
 * @param {string} [location.country] - Nombre del país (opcional, para debugging)
 * 
 * @returns {Promise<Object>} Objeto con datos climatológicos procesados
 * @returns {number} return.temperature - Temperatura en Celsius
 * @returns {number} return.windspeed - Velocidad del viento en km/h
 * @returns {number} return.weathercode - Código WMO del tipo de clima (0-99)
 * @returns {string} return.time - Hora en formato ISO (ej: "2026-04-15T14:30")
 * @returns {number|null} return.humidity - Humedad relativa en % (0-100) o null
 * @returns {boolean} return.fromCache - true si los datos vienen del caché
 * 
 * @throws {Error} Si location no tiene latitude/longitude definidas
 * @throws {Error} Si falla la conexión a la API (404, 429, 5xx, etc.)
 * @throws {Error} Si la solicitud excede el timeout de 10 segundos
 * @throws {Error} Si la respuesta no contiene estructura esperada
 * 
 * @example
 * // Ejemplo básico: obtener clima de Madrid (usa caché si disponible)
 * try {
 *   const location = {
 *     latitude: 40.4168,
 *     longitude: -3.7038,
 *     name: 'Madrid',
 *     country: 'España'
 *   };
 *   
 *   const weather = await fetchWeather(location);
 *   
 *   console.log(`Temperatura: ${weather.temperature}°C`);
 *   console.log(`Viento: ${weather.windspeed} km/h`);
 *   console.log(weather.fromCache ? '📭 Desde caché' : '🌐 Desde API');
 *   
 * } catch (error) {
 *   console.error('Error:', error.message);
 * }
 * 
 * @example
 * // Ejemplo: forzar actualización (limpiar caché primero)
 * async function getFreshWeather(location) {
 *   const cacheKey = generateCacheKey(location);
 *   cacheStorage.remove(cacheKey); // Forzar consulta a API
 *   return await fetchWeather(location);
 * }
 * 
 * @see getCachedWeather() - Para obtener datos del caché
 * @see setCachedWeather() - Para guardar datos en caché
 * @see clearWeatherCache() - Para limpiar todo el caché
 * @see getCacheStats() - Para ver estadísticas del caché
 * 
 * @note El timeout es de 10 segundos. API normal responde en 500-1000ms
 * @note Código de clima sigue estándar WMO (World Meteorological Organization)
 * @note Humedad puede ser null si Open-Meteo no retorna datos horarios completos
 * @note Requiere conexión a internet; API pública sin autenticación
 * @note Caché dura 1 hora y es multiplataforma (localStorage/Map)
 */
async function fetchWeather(location) {
  // Validar entrada
  if (!location?.latitude || !location?.longitude) {
    throw new Error('Ubicación inválida: faltan coordenadas.');
  }

  // 1. Verificar caché primero
  const cachedWeather = getCachedWeather(location);
  if (cachedWeather) {
    return { ...cachedWeather, fromCache: true };
  }

  // 2. No hay caché válido, consultar API
  const url = buildWeatherUrl(location);

  if (DEBUG) console.log('📡 Consultando API (caché vacío):', url);

  // Configurar AbortController para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEATHER_CONFIG.timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });

    // Manejo específico de errores HTTP
    if (response.status === 404) {
      throw new Error('Servicio de clima no encontrado (404).');
    } else if (response.status === 429) {
      throw new Error('Demasiadas solicitudes. Por favor, espera un momento.');
    } else if (response.status >= 500) {
      throw new Error('Servidor del clima en mantenimiento. Intenta más tarde.');
    } else if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}. No se pudo obtener el clima.`);
    }

    const data = await response.json();

    if (DEBUG) console.log('📊 Respuesta de API:', data);

    // Validar estructura de respuesta
    validateWeatherResponse(data);

    // Extraer y procesar datos
    const weatherData = extractWeatherData(data);

    // 3. Guardar en caché para futuras consultas
    setCachedWeather(location, weatherData);

    if (DEBUG) console.log('✅ Datos obtenidos de API y guardados en caché:', weatherData);

    return { ...weatherData, fromCache: false };

  } catch (error) {
    // Distinguir entre timeout y otros errores
    if (error.name === 'AbortError') {
      throw new Error(
        `La solicitud tardó demasiado (>${WEATHER_CONFIG.timeout}ms). Intenta de nuevo.`
      );
    }

    if (DEBUG) console.error('❌ Error al obtener clima:', error);

    throw error;

  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Busca la humedad relativa para la hora actual dentro de los datos horarios.
 * 
 * @param {Object} hourly - Datos horarios con time y relativehumidity_2m
 * @param {string} currentTime - Hora ISO a buscar (ej: "2026-04-15T14:30")
 * @returns {number|null} Humedad relativa en % o null si no está disponible
 */
function getHumidity(hourly, currentTime) {
  if (!hourly?.time || !hourly?.relativehumidity_2m) {
    if (DEBUG) console.warn('⚠️ Datos horarios incompleteos');
    return null;
  }

  const index = hourly.time.indexOf(currentTime);
  if (index === -1) {
    if (DEBUG) console.warn('⚠️ Hora exacta no encontrada en datos horarios');
    return null;
  }

  return hourly.relativehumidity_2m[index];
}

/**
 * Muestra el clima en la interfaz de usuario de forma segura.
 * Valida que location y weather tengan datos antes de mostrar.
 * 
 * @param {Object} location - Ubicación con name, country
 * @param {Object} weather - Datos del clima con temperatura, viento, etc
 */
function displayWeather(location, weather) {
  if (!location?.name || !location?.country) {
    console.error('❌ Ubicación incompleta');
    showError('Error al mostrar ubicación.');
    return;
  }

  if (!weather || weather.temperature === undefined) {
    console.error('❌ Datos de clima incompletos');
    showError('Error al mostrar clima.');
    return;
  }

  const weatherInfo = weatherCodeMap[weather.weathercode] || {
    text: 'Condiciones desconocidas',
    icon: 'fas fa-cloud',
  };

  locationName.textContent = `${location.name}, ${location.country}`;
  weatherDescription.textContent = weatherInfo.text;
  weatherIcon.className = weatherInfo.icon;
  temperatureC.textContent = `${weather.temperature.toFixed(1)}`;
  temperatureF.textContent = `${celsiusToFahrenheit(weather.temperature).toFixed(1)}`;
  humidity.textContent = weather.humidity !== null ? `${weather.humidity}%` : 'N/A';
  windSpeed.textContent = `${Math.round(weather.windspeed)} km/h`;
  localTime.textContent = formatLocalTime(weather.time);

  weatherContainer.classList.remove('hidden');

  if (DEBUG) {
    const source = weather.fromCache ? '📭 caché' : '🌐 API';
    console.log(`✅ Clima mostrado en UI (${source})`);
  }
}

/**
 * Convierte grados Celsius a Fahrenheit.
 * 
 * @param {number} celsius - Temperatura en Celsius
 * @returns {number} Temperatura en Fahrenheit
 */
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

/**
 * Normaliza texto para comparaciones sin acentos y con minúsculas.
 * Convierte "España" → "espana", "São Paulo" → "sao paulo"
 * 
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizeText(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Formatea la hora ISO devuelta por Open-Meteo.
 * Extrae la hora y minutos (ej: "2026-04-15T14:30" → "14:30")
 * 
 * @param {string} timeString - Hora en formato ISO
 * @returns {string} Hora formateada (HH:MM) o '---' si inválida
 */
function formatLocalTime(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    return '---';
  }
  const trimmed = timeString.slice(11, 16);
  return trimmed.match(/^\d{2}:\d{2}$/) ? trimmed : '---';
}

/**
 * Mapa de códigos de clima de Open-Meteo a texto e iconos.
 */
const weatherCodeMap = {
  0: { text: 'Cielo despejado', icon: 'fas fa-sun' },
  1: { text: 'Mayormente despejado', icon: 'fas fa-cloud-sun' },
  2: { text: 'Parcialmente nublado', icon: 'fas fa-cloud-sun' },
  3: { text: 'Nublado', icon: 'fas fa-cloud' },
  45: { text: 'Niebla', icon: 'fas fa-smog' },
  48: { text: 'Niebla helada', icon: 'fas fa-smog' },
  51: { text: 'Llovizna ligera', icon: 'fas fa-cloud-rain' },
  53: { text: 'Llovizna moderada', icon: 'fas fa-cloud-rain' },
  55: { text: 'Llovizna intensa', icon: 'fas fa-cloud-showers-heavy' },
  56: { text: 'Llovizna helada', icon: 'fas fa-snowflake' },
  57: { text: 'Llovizna helada intensa', icon: 'fas fa-snowflake' },
  61: { text: 'Lluvia ligera', icon: 'fas fa-cloud-rain' },
  63: { text: 'Lluvia moderada', icon: 'fas fa-cloud-rain' },
  65: { text: 'Lluvia intensa', icon: 'fas fa-cloud-showers-heavy' },
  66: { text: 'Lluvia helada ligera', icon: 'fas fa-snowflake' },
  67: { text: 'Lluvia helada intensa', icon: 'fas fa-snowflake' },
  71: { text: 'Nieve ligera', icon: 'fas fa-snowflake' },
  73: { text: 'Nieve moderada', icon: 'fas fa-snowflake' },
  75: { text: 'Nieve intensa', icon: 'fas fa-snowflake' },
  77: { text: 'Granos de nieve', icon: 'fas fa-snowflake' },
  80: { text: 'Chubascos ligeros', icon: 'fas fa-cloud-rain' },
  81: { text: 'Chubascos moderados', icon: 'fas fa-cloud-rain' },
  82: { text: 'Chubascos intensos', icon: 'fas fa-cloud-showers-heavy' },
  85: { text: 'Nieve ligera', icon: 'fas fa-snowflake' },
  86: { text: 'Nieve intensa', icon: 'fas fa-snowflake' },
  95: { text: 'Tormenta', icon: 'fas fa-cloud-bolt' },
  96: { text: 'Tormenta con granizo', icon: 'fas fa-cloud-bolt' },
  99: { text: 'Tormenta con granizo intenso', icon: 'fas fa-cloud-bolt' },
};

/**
 * Muestra un mensaje de error amigable al usuario.
 * Oculta contenedor de resultados.
 * 
 * @param {string} message - Mensaje de error a mostrar
 */
function showError(message) {
  if (!message || typeof message !== 'string') {
    message = 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  weatherContainer.classList.add('hidden');
  forecastContainer.classList.add('hidden');

  if (DEBUG) console.error('🔴 Error mostrado:', message);
}

/**
 * Restablece el estado de la interfaz antes de una nueva búsqueda.
 * Limpia mensajes de error previos.
 */
function resetDisplay() {
  errorMessage.classList.add('hidden');
  errorMessage.textContent = '';
  weatherContainer.classList.add('hidden');
  forecastContainer.classList.add('hidden');

  if (DEBUG) console.log('🔄 Interfaz reiniciada');
}
