//  Time and Date Display
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

// Weather Data (using Open-Meteo API - no API key required)
async function fetchWeather(lat, lon, elementId, cityName) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=America%2FToronto&forecast_days=3`
        );
        const data = await response.json();

        const current = data.current;
        const daily = data.daily;

        const weatherCode = getWeatherDescription(current.weathercode);
        const temp = Math.round(current.temperature_2m);
        const tempMax = Math.round(daily.temperature_2m_max[0]);
        const tempMin = Math.round(daily.temperature_2m_min[0]);

        const weatherHTML = `
            <div class="current-weather">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${temp}°C</div>
                <div style="color: #b0b8cc; margin-bottom: 0.5rem;">${weatherCode}</div>
                <div style="font-size: 0.85rem; color: #8891a8;">
                    H: ${tempMax}° L: ${tempMin}°
                </div>
            </div>
        `;

        // Append a Weather Underground search link for the city's 10-day forecast
        const wuSearch = `https://www.wunderground.com/search?query=${encodeURIComponent(cityName)}`;
        const weatherWithLink = weatherHTML + `
            <div style="margin-top:0.6rem;">
                <a href="${wuSearch}" target="_blank" rel="noopener" style="font-size:0.85rem; color:#9fb2ff; text-decoration:none;">10-day forecast on Weather Underground</a>
            </div>
        `;

        document.getElementById(elementId).innerHTML = weatherWithLink;
    } catch (error) {
        console.error('Error fetching weather:', error);
        document.getElementById(elementId).innerHTML = '<div style="color: #f87171;">Weather unavailable</div>';
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
        85: 'Light Snow Showers',
        86: 'Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Thunderstorm with Hail'
    };
    return weatherCodes[code] || 'Unknown';
}

// Stock Market Data
async function fetchStockData() {
    try {
        // Using a simple approach with Yahoo Finance alternative API
        // Note: For production, you may want to use a paid API like Alpha Vantage or IEX Cloud

        // For demo purposes, we'll simulate the data
        // In production, replace with actual API calls
        updateStockDisplay('dow', 38000 + Math.random() * 1000, Math.random() > 0.5);
        updateStockDisplay('nasdaq', 16000 + Math.random() * 500, Math.random() > 0.5);

    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

function updateStockDisplay(symbol, value, isPositive) {
    const change = (Math.random() * 2 - 1).toFixed(2);
    const changePercent = (Math.random() * 2).toFixed(2);

    const valueElement = document.getElementById(`${symbol}-value`);
    const changeElement = document.getElementById(`${symbol}-change`);

    if (valueElement && changeElement) {
        valueElement.textContent = value.toFixed(2);
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change} (${change >= 0 ? '+' : ''}${changePercent}%)`;
        changeElement.className = 'stock-change ' + (change >= 0 ? 'positive' : 'negative');
    }
}

// Daily Quote
const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Everything has beauty, but not everyone can see.", author: "Confucius" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
    { text: "You do not find the happy life. You make it.", author: "Camilla Eyring Kimball" },
    { text: "Happiness is not by chance, but by choice.", author: "Jim Rohn" },
    { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" }
];

function displayDailyQuote() {
    // Try fetching a random quote from quotable.io; fallback to local list on failure
    (async () => {
        try {
            const res = await fetch('https://api.quotable.io/random');
            if (res.ok) {
                const q = await res.json();
                document.getElementById('quote-text').textContent = `"${q.content}"`;
                document.getElementById('quote-author').textContent = q.author || '';
                return;
            }
        } catch (e) {
            console.warn('Quote API failed, using local fallback:', e);
        }

        // Local fallback: choose a random quote so it changes on each load
        const idx = Math.floor(Math.random() * quotes.length);
        const quote = quotes[idx];
        document.getElementById('quote-text').textContent = `"${quote.text}"`;
        document.getElementById('quote-author').textContent = quote.author || '';
    })();
}

// Daily Photograph (using Unsplash API)
async function displayDailyPhoto() {
    try {
        // Use picsum.photos with a seed so the photograph reliably appears and can be deterministic per day
        const today = new Date().toISOString().split('T')[0];
        const seed = today;

        const categories = ['nature', 'landscape', 'architecture', 'wildlife', 'travel'];
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const category = categories[dayOfYear % categories.length];

        // Picsum supports seeded images via /seed/{seed}/{width}/{height}
        const photoUrl = `https://picsum.photos/seed/${encodeURIComponent(category + '-' + seed)}/1200/600`;

        const img = document.getElementById('daily-photo');
        img.src = photoUrl;
        img.alt = `Daily ${category} photograph`;

        document.getElementById('photo-caption').textContent = `Today's featured ${category} photograph`;
    } catch (error) {
        console.error('Error loading daily photo:', error);
        document.getElementById('photo-caption').textContent = 'Photo unavailable';
    }
}

// Initialize everything
function init() {
    // Update time immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);

    // Ottawa coordinates: 45.4215, -75.6972
    // Chelsea, QC coordinates: 45.5, -75.8
    fetchWeather(45.4215, -75.6972, 'weather-ottawa', 'Ottawa');
    fetchWeather(45.5, -75.8, 'weather-chelsea', 'Chelsea, QC');

    // Refresh weather every 15 minutes
    setInterval(() => {
        fetchWeather(45.4215, -75.6972, 'weather-ottawa', 'Ottawa');
        fetchWeather(45.5, -75.8, 'weather-chelsea', 'Chelsea, QC');
    }, 15 * 60 * 1000);

    // Update stock data immediately and every 15 minutes
    fetchStockData();
    setInterval(fetchStockData, 15 * 60 * 1000);

    // Display daily quote and photo
    displayDailyQuote();
    displayDailyPhoto();
}

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
