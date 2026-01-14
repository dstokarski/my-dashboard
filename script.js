// Time and Date Display
function updateTime() {
    const now = new Date();
    const timeOptions = {
        timeZone: 'America/Toronto',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
    };

    const dateOptions = {
        timeZone: 'America/Toronto',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    const dateString = now.toLocaleDateString('en-US', dateOptions);

    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// Weather Data using Open-Meteo API
async function fetchWeather(lat, lon, elementId, wundergroundUrl) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=America%2FToronto&forecast_days=5`;

        const response = await fetch(url);
        const data = await response.json();

        const current = data.current;
        const daily = data.daily;

        const temp = Math.round(current.temperature_2m);
        const weatherDesc = getWeatherDescription(current.weathercode);
        const humidity = Math.round(current.relativehumidity_2m);
        const windSpeed = Math.round(current.windspeed_10m);

        let forecastHTML = '';
        for (let i = 1; i < 5; i++) {
            const date = new Date(daily.time[i]);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);

            forecastHTML += `
                <div class="forecast-day">
                    <div class="forecast-day-name">${dayName}</div>
                    <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
                </div>
            `;
        }

        const weatherHTML = `
            <div class="weather-current">
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-condition">${weatherDesc}</div>
                <div class="weather-details">
                    <span>💧 ${humidity}%</span>
                    <span>💨 ${windSpeed} km/h</span>
                </div>
            </div>
            <div class="weather-forecast">
                ${forecastHTML}
            </div>
            <a href="${wundergroundUrl}" target="_blank" class="weather-link">10 Day Forecast</a>
        `;

        document.getElementById(elementId).innerHTML = weatherHTML;
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.getElementById(elementId).innerHTML = '<p class="loading">Unable to load weather</p>';
    }
}

function getWeatherDescription(code) {
    const codes = {
        0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle',
        55: 'Heavy Drizzle', 61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
        71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
        80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
        85: 'Light Snow Showers', 86: 'Snow Showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Severe Thunderstorm'
    };
    return codes[code] || 'Unknown';
}

// Initialize
function init() {
    // Update time immediately and every second
    updateTime();
    setInterval(updateTime, 1000);

    // Fetch weather for Ottawa and Chelsea
    fetchWeather(45.4215, -75.6972, 'weather-ottawa', 'https://www.wunderground.com/forecast/ca/ottawa');
    fetchWeather(45.5, -75.8, 'weather-chelsea', 'https://www.wunderground.com/forecast/ca/chelsea');

    // Refresh weather every 15 minutes
    setInterval(() => {
        fetchWeather(45.4215, -75.6972, 'weather-ottawa', 'https://www.wunderground.com/forecast/ca/ottawa');
        fetchWeather(45.5, -75.8, 'weather-chelsea', 'https://www.wunderground.com/forecast/ca/chelsea');
    }, 15 * 60 * 1000);
}

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
