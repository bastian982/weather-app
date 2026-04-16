// ============================================
// EJEMPLO DE USO DEL SISTEMA DE CACHÉ
// ============================================

/**
 * Ejemplo completo de cómo usar el sistema de caché de clima.
 * Este código demuestra las funciones principales del caché.
 */

// Simular una ubicación de Madrid
const testLocation = {
  latitude: 40.4168,
  longitude: -3.7038,
  name: 'Madrid',
  country: 'España'
};

// Función de ejemplo para demostrar el caché
async function demonstrateCache() {
  console.log('🧪 DEMOSTRACIÓN DEL SISTEMA DE CACHÉ\n');

  try {
    // 1. Primera consulta (debería ir a API)
    console.log('1️⃣ Primera consulta (debería consultar API):');
    const weather1 = await fetchWeather(testLocation);
    console.log(`   Temperatura: ${weather1.temperature}°C`);
    console.log(`   Fuente: ${weather1.fromCache ? '📭 Caché' : '🌐 API'}`);
    console.log(`   Timestamp: ${new Date().toLocaleTimeString()}\n`);

    // 2. Segunda consulta inmediata (debería usar caché)
    console.log('2️⃣ Segunda consulta (debería usar caché):');
    const weather2 = await fetchWeather(testLocation);
    console.log(`   Temperatura: ${weather2.temperature}°C`);
    console.log(`   Fuente: ${weather2.fromCache ? '📭 Caché' : '🌐 API'}`);
    console.log(`   Timestamp: ${new Date().toLocaleTimeString()}\n`);

    // 3. Verificar estadísticas del caché (solo en navegador)
    console.log('3️⃣ Estadísticas del caché:');
    const stats = getCacheStats();
    if (stats.available) {
      console.log(`   Entradas totales: ${stats.entries}`);
      console.log(`   Entradas válidas: ${stats.validEntries}`);
      console.log(`   Entradas expiradas: ${stats.expiredEntries}`);
      console.log(`   Tamaño aproximado: ${stats.totalSizeKB} KB\n`);
    } else {
      console.log(`   ${stats.message}\n`);
    }

    // 4. Limpiar caché y consultar nuevamente
    console.log('4️⃣ Limpiando caché y consultando nuevamente:');
    clearWeatherCache();
    const weather3 = await fetchWeather(testLocation);
    console.log(`   Temperatura: ${weather3.temperature}°C`);
    console.log(`   Fuente: ${weather3.fromCache ? '📭 Caché' : '🌐 API'}`);
    console.log(`   Timestamp: ${new Date().toLocaleTimeString()}\n`);

    console.log('✅ Demostración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la demostración:', error.message);
  }
}

// Función para probar la generación de claves de caché
function demonstrateCacheKeys() {
  console.log('\n🔑 DEMOSTRACIÓN DE CLAVES DE CACHÉ\n');

  const locations = [
    { latitude: 40.4168, longitude: -3.7038, name: 'Madrid' },
    { latitude: 41.3851, longitude: 2.1734, name: 'Barcelona' },
    { latitude: 40.4169, longitude: -3.7039, name: 'Madrid (ligeramente diferente)' },
  ];

  locations.forEach((location, index) => {
    try {
      const key = generateCacheKey(location);
      console.log(`${index + 1}. ${location.name}: ${key}`);
    } catch (error) {
      console.error(`${index + 1}. Error generando clave: ${error.message}`);
    }
  });
}

// ============================================
// INSTRUCCIONES PARA PROBAR
// ============================================

/*
Para probar el sistema de caché:

1. Abre la consola del navegador (F12 → Console)
2. Ejecuta: demonstrateCache()
3. Observa cómo la primera consulta va a la API y las siguientes usan caché
4. Ejecuta: demonstrateCacheKeys() para ver cómo se generan las claves

Ejemplo de salida esperada:

🧪 DEMOSTRACIÓN DEL SISTEMA DE CACHÉ

1️⃣ Primera consulta (debería consultar API):
   Temperatura: 23.5°C
   Fuente: 🌐 API
   Timestamp: 14:30:25

2️⃣ Segunda consulta (debería usar caché):
   Temperatura: 23.5°C
   Fuente: 📭 Caché
   Timestamp: 14:30:26

3️⃣ Estadísticas del caché:
   Entradas totales: 1
   Entradas válidas: 1
   Entradas expiradas: 0
   Tamaño aproximado: 0.45 KB

4️⃣ Limpiando caché y consultando nuevamente:
   Temperatura: 23.5°C
   Fuente: 🌐 API
   Timestamp: 14:30:27

✅ Demostración completada exitosamente!
*/