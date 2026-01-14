// Time and Date
function updateTime() {
    const now = new Date();
    const options = { timeZone: 'America/Toronto', hour12: true };

    const timeString = now.toLocaleTimeString('en-US', {
        ...options,
        hour: '2-digit',
        minute: '2-digit'
    });

    const dateString = now.toLocaleDateString('en-US', {
        ...options,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// Weather Data (using Open-Meteo API)
async function fetchWeather(lat, lon, elementId) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=America%2FToronto&forecast_days=5`
        );
        const data = await response.json();

        const current = data.current;
        const daily = data.daily;

        const weatherCode = getWeatherDescription(current.weathercode);
        const temp = Math.round(current.temperature_2m);
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
                <div class="weather-condition">${weatherCode}</div>
                <div class="weather-details">
                    <span>💧 ${humidity}%</span>
                    <span>💨 ${windSpeed} km/h</span>
                </div>
            </div>
            <div class="weather-forecast">
                ${forecastHTML}
            </div>
        `;

        document.getElementById(elementId).innerHTML = weatherHTML;
    } catch (error) {
        console.error('Error fetching weather:', error);
        document.getElementById(elementId).innerHTML = '<p class="loading">Weather unavailable</p>';
    }
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Drizzle',
        55: 'Heavy Drizzle',
        61: 'Light Rain',
        63: 'Rain',
        65: 'Heavy Rain',
        71: 'Light Snow',
        73: 'Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Light Showers',
        81: 'Showers',
        82: 'Heavy Showers',
        85: 'Light Snow',
        86: 'Snow',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Thunderstorm with Hail'
    };
    return weatherCodes[code] || 'Unknown';
}

// Initialize
function init() {
    updateTime();
    setInterval(updateTime, 1000);

    // Ottawa: 45.4215, -75.6972
    // Chelsea: 45.5, -75.8
    fetchWeather(45.4215, -75.6972, 'weather-ottawa');
    fetchWeather(45.5, -75.8, 'weather-chelsea');

    // Refresh weather every 15 minutes
    setInterval(() => {
        fetchWeather(45.4215, -75.6972, 'weather-ottawa');
        fetchWeather(45.5, -75.8, 'weather-chelsea');
    }, 15 * 60 * 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
