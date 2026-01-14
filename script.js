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

// Fetch random photos from Unsplash
async function fetchPhotos() {
    try {
        // Photo 1 - Random interesting photo
        const img1 = document.createElement('img');
        img1.src = `https://picsum.photos/400/250?random=${Date.now()}`;
        img1.alt = 'Photo of the Day';
        img1.className = 'random-photo';
        document.getElementById('photo-1').innerHTML = '';
        document.getElementById('photo-1').appendChild(img1);

        // Photo 2 - Nature photo
        const img2 = document.createElement('img');
        img2.src = `https://picsum.photos/400/250?random=${Date.now() + 1}&nature`;
        img2.alt = 'Nature';
        img2.className = 'random-photo';
        document.getElementById('photo-2').innerHTML = '';
        document.getElementById('photo-2').appendChild(img2);
    } catch (error) {
        console.error('Photo fetch error:', error);
    }
}

// Fetch inspirational quote
async function fetchQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random?tags=inspirational|motivational|wisdom');
        if (!response.ok) throw new Error('Quote API failed');
        const data = await response.json();
        document.getElementById('quote-content').innerHTML = `
            <blockquote class="quote-text">"${data.content}"</blockquote>
            <cite class="quote-author">— ${data.author}</cite>
        `;
    } catch (error) {
        console.error('Quote fetch error:', error);
        // Fallback quotes
        const fallbackQuotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" }
        ];
        const quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        document.getElementById('quote-content').innerHTML = `
            <blockquote class="quote-text">"${quote.text}"</blockquote>
            <cite class="quote-author">— ${quote.author}</cite>
        `;
    }
}

// Fetch daily joke
async function fetchJoke() {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        if (!response.ok) throw new Error('Joke API failed');
        const data = await response.json();
        document.getElementById('joke-content').innerHTML = `
            <p class="joke-setup">${data.setup}</p>
            <p class="joke-punchline">${data.punchline}</p>
        `;
    } catch (error) {
        console.error('Joke fetch error:', error);
        // Fallback jokes
        const fallbackJokes = [
            { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
            { setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!" },
            { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
            { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
            { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" }
        ];
        const joke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        document.getElementById('joke-content').innerHTML = `
            <p class="joke-setup">${joke.setup}</p>
            <p class="joke-punchline">${joke.punchline}</p>
        `;
    }
}

// Fetch daily suggestions - interesting websites that change daily
function fetchSuggestions() {
    const allSuggestions = [
        { text: "Atlas Obscura", url: "https://www.atlasobscura.com", desc: "Discover hidden wonders" },
        { text: "Brain Pickings", url: "https://www.themarginalian.org", desc: "Wisdom and creativity" },
        { text: "Astronomy Picture of the Day", url: "https://apod.nasa.gov", desc: "Daily space images" },
        { text: "Open Culture", url: "https://www.openculture.com", desc: "Free cultural media" },
        { text: "Wait But Why", url: "https://waitbutwhy.com", desc: "Deep dives into topics" },
        { text: "Smithsonian Magazine", url: "https://www.smithsonianmag.com", desc: "History and science" },
        { text: "Aeon", url: "https://aeon.co", desc: "Ideas and culture" },
        { text: "Nautilus", url: "https://nautil.us", desc: "Science storytelling" },
        { text: "The Pudding", url: "https://pudding.cool", desc: "Visual essays" },
        { text: "99% Invisible", url: "https://99percentinvisible.org", desc: "Design stories" },
        { text: "Longform", url: "https://longform.org", desc: "Best journalism" },
        { text: "Curious", url: "https://www.curiouscurio.us", desc: "Explore curiosities" },
        { text: "The School of Life", url: "https://www.theschooloflife.com", desc: "Emotional education" },
        { text: "Letters of Note", url: "https://lettersofnote.com", desc: "Historic letters" },
        { text: "Mental Floss", url: "https://www.mentalfloss.com", desc: "Fun facts and trivia" },
        { text: "TED Ideas", url: "https://ideas.ted.com", desc: "Ideas worth spreading" },
        { text: "Pocket Worthy", url: "https://getpocket.com/explore", desc: "Curated reads" },
        { text: "Farnam Street", url: "https://fs.blog", desc: "Mental models" },
        { text: "Quanta Magazine", url: "https://www.quantamagazine.org", desc: "Math and science" },
        { text: "The Conversation", url: "https://theconversation.com", desc: "Academic insights" }
    ];

    // Use day of year as seed for consistent daily selection
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    // Shuffle based on day
    const shuffled = [...allSuggestions].sort((a, b) => {
        const hashA = (dayOfYear * 31 + allSuggestions.indexOf(a)) % 100;
        const hashB = (dayOfYear * 31 + allSuggestions.indexOf(b)) % 100;
        return hashA - hashB;
    });

    const dailySuggestions = shuffled.slice(0, 5);

    const html = `
        <ul class="suggestions-list">
            ${dailySuggestions.map(s => `
                <li>
                    <a href="${s.url}" target="_blank">${s.text}</a>
                    <span class="suggestion-desc">${s.desc}</span>
                </li>
            `).join('')}
        </ul>
    `;

    document.getElementById('suggestions-content').innerHTML = html;
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

    // Load static card content
    fetchPhotos();
    fetchQuote();
    fetchJoke();
    fetchSuggestions();
}

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
