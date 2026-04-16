<<<<<<< HEAD
# Aplicación del Clima 🌤️

Una aplicación web moderna y responsiva que permite consultar el clima actual de cualquier ciudad del mundo utilizando la API gratuita de [Open-Meteo](https://open-meteo.com/).

## 📋 Resumen del Proyecto

**Clima** es una aplicación web minimalista construida con **HTML, CSS y JavaScript puro** (Vanilla JS). Permite a los usuarios buscar el clima actual de una ciudad especificando el país, validando que ambos coincidan. La aplicación consume dos endpoints de Open-Meteo sin necesidad de API key:

- **Geocodificación**: convierte ciudad + país a coordenadas (latitud/longitud)
- **Clima actual**: obtiene datos meteorológicos en tiempo real

## 🎯 Funcionalidades

✅ **Búsqueda de clima** — Ingresa ciudad y país para obtener climatología actual  
✅ **Temperatura dual** — Muestra valores en Celsius y Fahrenheit  
✅ **Iconos visuales** — Iconografía del clima que representa la condición meteorológica  
✅ **Datos completos** — Temperatura, humedad, velocidad del viento y hora local  
✅ **Validación inteligente** — Verifica que ciudad y país coincidan antes de mostrar resultados  
✅ **Manejo de errores** — Mensajes claros y amigables para el usuario  
✅ **Diseño responsivo** — Funciona perfectamente en desktop, tablet y móvil  
✅ **Sin dependencias externas** — JavaScript puro, sin frameworks  
✅ **Sin autenticación** — Usa API pública de Open-Meteo (sin API key requerida)  
✅ **Sistema de caché** — Almacena resultados por 1 hora para mejor rendimiento  
✅ **Pronóstico 5 días** — Muestra previsión meteorológica para los próximos 5 días  
✅ **Historial de búsqueda** — Guarda las últimas búsquedas y permite volver a consultarlas fácilmente  
✅ **Eliminar historial** — Limpia el historial con un botón directo

## 🎨 Características de Diseño

### Interfaz Moderna y Atractiva
- **Diseño glassmorphism** — Efectos de vidrio esmerilado con backdrop-filter
- **Gradientes sutiles** — Fondos dinámicos con múltiples capas de gradiente
- **Animaciones fluidas** — Transiciones suaves y efectos hover elegantes
- **Paleta de colores coherente** — Variables CSS para consistencia visual

### Íconos y Visualización
- **Font Awesome 6.4.0** — Librería completa de íconos modernos y consistentes
- **Íconos contextuales** — Cada condición climática tiene su ícono correspondiente
- **Íconos de detalles** — Humedad (💧), Viento (🌪️), Hora (🕐) con íconos dedicados
- **Efectos visuales** — Sombras, gradientes y animaciones sutiles

### Diseño Responsivo
- **Mobile-first** — Optimizado para dispositivos móviles
- **Breakpoints inteligentes** — Adaptación perfecta en tablet y desktop
- **Layout flexible** — Grid y flexbox para layouts adaptativos
- **Tipografía escalable** — Fuentes que se ajustan al tamaño de pantalla

## 🚀 Instalación

### Requisitos previos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para consumir la API de Open-Meteo)

### Pasos

1. **Clona o descarga el proyecto:**
   ```bash
   git clone https://github.com/tu-usuario/clima.git
   cd clima
   ```

2. **Abre la aplicación:**
   - Opción A (Directa): Abre `index.html` en tu navegador
   - Opción B (Servidor local): Si tu navegador bloquea CORS, usa un servidor local:
     ```bash
     # Con Python 3
     python -m http.server 8000
     
     # Con Python 2
     python -m SimpleHTTPServer 8000
     
     # Con Node.js (http-server)
     npx http-server
     ```
     Luego accede a `http://localhost:8000`

## 📖 Guía de Uso

### Búsqueda básica

1. **Ingresa la ciudad**: escribe el nombre de la ciudad (ej. "Madrid", "Nueva York")
2. **Ingresa el país**: escribe el nombre del país (ej. "España", "Estados Unidos")
3. **Haz clic en "Buscar"** o presiona `Enter`
4. **Visualiza los resultados** en la tarjeta de clima

### Ejemplos de búsquedas válidas

| Ciudad | País | Resultado |
|--------|------|-----------|
| Madrid | España | ✅ Muestra clima de Madrid, España |
| París | Francia | ✅ Muestra clima de París, Francia |
| Londres | Reino Unido | ✅ Muestra clima de Londres, Reino Unido |
| Tokio | Japón | ✅ Muestra clima de Tokio, Japón |
| Nueva York | Estados Unidos | ✅ Muestra clima de Nueva York, EE.UU. |

### Manejo de errores

La aplicación detecta y comunica claramente los siguientes errores:

| Error | Causa | Solución |
|-------|-------|----------|
| "Debes ingresar ciudad y país" | Campos vacíos | Completa ambos campos |
| "No se encontró la ciudad indicada" | Ciudad inexistente | Verifica la ortografía |
| "La ciudad y el país no coinciden..." | País incorrecto | Asegúrate que la ciudad pertenece al país |
| "No se pudo consultar la geocodificación..." | Error de red/API | Intenta más tarde |
| "No se pudo obtener el clima..." | Servidor inaccesible | Verifica tu conexión |

## 📊 Ejemplo de Resultados

### Entrada del usuario:
```
Ciudad: Madrid
País: España
```

### Salida mostrada:
```
Madrid, España
Parcialmente soleado

23.5°C  |  74.3°F

Humedad: 65%
Viento: 12 km/h
Hora local: 14:32
```

Con icono visual del clima (☁️ en este caso)

## 🏗️ Estructura del Proyecto

```
clima/
├── index.html          # Estructura HTML de la aplicación
├── styles.css          # Estilos, gradientes y diseño responsivo
├── script.js           # Lógica JavaScript (async/await, validación, caché)
├── cache-demo.js       # Demostración del sistema de caché
└── README.md           # Este archivo
```

### Archivos principales

**index.html**
- Estructura semántica con etiquetas HTML5
- Formulario con campos de ciudad y país
- Contenedor de resultados y errores
- CDN de Font Awesome 6.4.0 y Tailwind CSS

**styles.css**
- Diseño moderno con Tailwind CSS utility classes
- Glassmorphism (efecto vidrio esmerilado)
- Responsive design con breakpoints de Tailwind
- Animaciones suaves y efectos hover

**script.js**
- Endpoints de Open-Meteo API
- Función `searchLocation()` — busca coordenadas de la ciudad
- Función `fetchWeather()` — obtiene clima actual
- Validación de coincidencia ciudad-país
- Conversión Celsius ↔ Fahrenheit
- Mapeo de códigos de clima a íconos Font Awesome
- Manejo de promesas con async/await

## � Sistema de Caché

La aplicación incluye un sistema de caché inteligente que almacena los resultados del clima durante **1 hora** para mejorar el rendimiento y reducir las llamadas a la API.

### Características del Caché

✅ **Duración de 1 hora** — Datos válidos por 60 minutos  
✅ **Multiplataforma** — Funciona en navegador (localStorage) y Node.js (Map en memoria)  
✅ **Validación automática** — Elimina datos expirados automáticamente  
✅ **Claves únicas** — Basadas en coordenadas para precisión  
✅ **Transparente** — Funciona automáticamente sin intervención del usuario  
✅ **Debugging opcional** — Logs detallados cuando DEBUG=true  

### Cómo funciona

1. **Primera consulta**: Se consulta la API y se guardan los datos con timestamp
2. **Consultas siguientes**: Se verifica el caché primero (si es válido, se usa)
3. **Expiración**: Después de 1 hora, se consulta la API nuevamente
4. **Almacenamiento**: localStorage en navegador, Map en memoria en Node.js

### Funciones de Caché

| Función | Descripción |
|---------|-------------|
| `getCachedWeather(location)` | Obtiene datos del caché si son válidos |
| `setCachedWeather(location, data)` | Guarda datos en caché con timestamp |
| `clearWeatherCache()` | Limpia todo el caché |
| `getCacheStats()` | Estadísticas del caché (solo navegador) |
| `generateCacheKey(location)` | Genera clave única para coordenadas |

### Ejemplo de uso del caché

```javascript
// Primera consulta (va a API)
const weather1 = await fetchWeather(location);
// Resultado: { temperature: 23.5, fromCache: false }

// Segunda consulta (usa caché)
const weather2 = await fetchWeather(location);
// Resultado: { temperature: 23.5, fromCache: true }

// Forzar actualización
clearWeatherCache();
const weather3 = await fetchWeather(location);
// Resultado: { temperature: 23.5, fromCache: false }
```

### Probar el caché

Para probar el sistema de caché en funcionamiento:

1. **Abre la consola del navegador** (F12 → Console)
2. **Ejecuta la demostración:**
   ```javascript
   // Carga el archivo de demo (cópialo a la consola)
   // O incluye <script src="cache-demo.js"></script> en index.html
   demonstrateCache();
   ```
3. **Observa los logs** que muestran cuándo se usa caché vs API
4. **Verifica estadísticas:**
   ```javascript
   getCacheStats();
   ```

### Archivo de demostración

El archivo `cache-demo.js` incluye funciones para probar todas las características del caché:

- `demonstrateCache()` — Muestra el flujo completo de caché
- `demonstrateCacheKeys()` — Muestra cómo se generan las claves

Incluye el archivo en tu HTML o cópialo a la consola para probar.

### Beneficios del caché

- 🚀 **Rendimiento**: Consultas instantáneas para datos recientes
- 📊 **Eficiencia**: Reduce llamadas a API innecesarias
- 💰 **Ahorro**: Menos uso de cuota de API (si aplica)
- 🌐 **Offline-ready**: Podría extenderse para modo offline
- 🔄 **Transparente**: Funciona automáticamente sin cambios en UI

## 🔌 Integración con API

### Endpoints utilizados

#### 1. Geocodificación
```
GET https://geocoding-api.open-meteo.com/v1/search?name={city}&count=10&language=es
```
Retorna: lista de ubicaciones con país, coordenadas, etc.

#### 2. Clima actual
```
GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=relativehumidity_2m&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto
```
Retorna: temperatura, viento, humedad, código de clima, hora local

### Validación de API

✅ **No requiere API key** — endpoints públicos de Open-Meteo  
✅ **Límite de llamadas** — muy generoso (sin restricciones prácticas)  
✅ **CORS habilitado** — funciona directamente desde el navegador  
✅ **Datos en tiempo real** — actualizados constantemente

## 📱 Casos de prueba

### Pruebas funcionales

| Test | Entrada | Resultado esperado |
|------|---------|-------------------|
| Búsqueda válida | Madrid + España | Muestra clima correcto |
| Ciudad inválida | Xyzabc + España | Mensaje "No se encontró" |
| País incorrecto | París + España | Mensaje "No coinciden" |
| Campos vacíos | (vacío) + (vacío) | Mensaje "Ingresa datos" |
| País alternativo | Londres + GB | Acepta código de país |
| Acentos | São Paulo + Brasil | Normaliza y funciona |

### Pruebas de responsividad

- ✅ Desktop (1920px +)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

### Pruebas de error

- ✅ Sin conexión a internet
- ✅ API no disponible
- ✅ Timeout de solicitud
- ✅ Respuesta vacía

## 🎨 Personalización

### Cambiar esquema de colores

En `styles.css`, modifica las variables CSS:

```css
:root {
  color-scheme: dark;  /* o 'light' */
  color: #f5f7fa;      /* color de texto */
  background: #0b1622; /* color de fondo */
}
```

### Cambiar unidades de velocidad

En `script.js`, modifica el parámetro `windspeed_unit`:

```javascript
// Cambiar de 'kmh' a 'ms' o 'mph'
&windspeed_unit=kmh
```

### Agregar más códigos de clima

En `script.js`, expande el objeto `weatherCodeMap`:

```javascript
const weatherCodeMap = {
  0: { text: 'Cielo despejado', icon: 'fas fa-sun' },
  1: { text: 'Mayormente despejado', icon: 'fas fa-cloud-sun' },
  2: { text: 'Parcialmente nublado', icon: 'fas fa-cloud-sun' },
  3: { text: 'Nublado', icon: 'fas fa-cloud' },
  // ... más códigos

- 🔄 **Pronóstico extendido** — Mostrar clima para los próximos 7 días
- 📍 **Geolocalización** — Detectar ubicación automática del usuario
- ⭐ **Favoritos** — Guardar ciudades frecuentes en LocalStorage
- 🌍 **Múltiples idiomas** — Interfaz en inglés, francés, alemán, etc.
- 📊 **Gráficos** — Visualizar tendencias de temperatura y humedad
- 🔔 **Notificaciones** — Alertas de mal tiempo o cambios importantes
- 🌙 **Modo noche automático** — Cambiar tema según hora local
- 📍 **Mapa interactivo** — Integración con mapa de visualización
- 💾 **Historial** — Registrar búsquedas en LocalStorage o base de datos
- 🌐 **PWA** — Hacer la app instalable como Progressive Web App
- ⚡ **Service Worker** — Caché offline avanzado con service workers
- 📈 **Analytics** — Métricas de uso y rendimiento del caché

## 📝 Notas de desarrollo

### Buenas prácticas implementadas

✅ Uso de `const` y `let` en lugar de `var`  
✅ Funciones pequeñas con responsabilidad única  
✅ Comentarios descriptivos en JSDoc  
✅ Nombres de variables claros y semánticos  
✅ Manejo de errores con try/catch  
✅ Promesas con async/await  
✅ Normalización de texto (sin acentos, minúsculas)  
✅ Código modular y reutilizable  

### Normalización de texto

La función `normalizeText()` convierte caracteres acentuados a sus equivalentes:
- "España" → "espana"
- "País" → "pais"
- "São Paulo" → "sao paulo"

Esto permite búsquedas más flexibles y evita problemas con acentos.

## 🐛 Solución de problemas

### El icono del clima no se muestra
- Verifica que Weather Icons CDN esté disponible
- Comprueba la consola del navegador para errores de CORS

### "No se pudo consultar..." error
- Verifica tu conexión a internet
- Comprueba si Open-Meteo está disponible (https://open-meteo.com/status)
- Intenta desde un navegador diferente

### Búsqueda lenta
- Open-Meteo puede tomar 1-2 segundos por solicitud
- Verifica tu velocidad de conexión
- Intenta nuevamente en una ubicación con mejor conexión

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT. Puedes usar, modificar y distribuir libremente.

## 👨‍💻 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras problemas o tienes sugerencias:
- Abre un [issue en GitHub](https://github.com/tu-usuario/clima/issues)
- Revisa la sección "Solución de problemas" en este README

## 🙏 Agradecimientos

- [Open-Meteo](https://open-meteo.com/) por la API gratuita y confiable
- [Font Awesome](https://fontawesome.com/) por los íconos modernos
- [Tailwind CSS](https://tailwindcss.com/) por el framework de estilos utilitarios
- Comunidad de desarrolladores por los aportes y sugerencias

## 🆕 Cambios Recientes

### v1.1.0 - Migración a Tecnologías Modernas

**✨ Mejoras implementadas:**
- 🔄 **Migración completa a Tailwind CSS** — Reemplazado CSS personalizado por utility classes
- 🎨 **Font Awesome 6.4.0** — Sustitución de Weather Icons por íconos más modernos
- 📱 **Mejora en columnas del pronóstico** — Optimización del layout responsive
- 🎯 **Código más mantenible** — Arquitectura CSS más limpia y escalable

**📁 Archivos modificados:**
- `styles.css` — Refactorización completa con Tailwind CSS
- `script.js` — Actualización del `weatherCodeMap` con íconos Font Awesome
- `index.html` — Actualización de CDN y clases de íconos
- `README.md` — Documentación actualizada

**🔧 Beneficios:**
- 🚀 **Mejor rendimiento** — Tailwind CSS optimiza el bundle final
- 🎨 **Consistencia visual** — Sistema de diseño unificado
- 📱 **Responsive mejorado** — Breakpoints más precisos
- 🔧 **Mantenibilidad** — Código CSS más fácil de modificar
- 🌟 **Íconos modernos** — Font Awesome ofrece mejor calidad visual

---

**Última actualización:** Abril 2026  
**Versión:** 1.1.0  
**Estado:** Producción ✅
=======
# weather-app
Weather App is a lightweight app built with Vanilla HTML, CSS, and JavaScript that fetches current weather and a 5-day forecast from the public Open-Meteo API. It supports city + country search, result validation, intelligent local caching, and a modern responsive UI.
>>>>>>> d1d9e77d3ec2933a29f71c9e5895bdcb8fde66d4
