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

// Fetch random photos
function fetchPhotos() {
    const photo1 = document.getElementById('photo-1');
    const photo2 = document.getElementById('photo-2');

    if (photo1) {
        const img1 = document.createElement('img');
        img1.src = `https://picsum.photos/400/250?random=${Date.now()}`;
        img1.alt = 'Photo of the Day';
        img1.className = 'random-photo';
        img1.onerror = () => { photo1.innerHTML = '<p class="loading">Photo unavailable</p>'; };
        photo1.innerHTML = '';
        photo1.appendChild(img1);
    }

    if (photo2) {
        const img2 = document.createElement('img');
        img2.src = `https://picsum.photos/400/250?random=${Date.now() + 1}`;
        img2.alt = 'Nature';
        img2.className = 'random-photo';
        img2.onerror = () => { photo2.innerHTML = '<p class="loading">Photo unavailable</p>'; };
        photo2.innerHTML = '';
        photo2.appendChild(img2);
    }
}

// Fetch inspirational quote
function fetchQuote() {
    const quoteEl = document.getElementById('quote-content');
    if (!quoteEl) return;

    const fallbackQuotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
        { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
    ];

    // Use fallback quotes directly (APIs often have CORS issues)
    const quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    quoteEl.innerHTML = `
        <blockquote class="quote-text">"${quote.text}"</blockquote>
        <cite class="quote-author">— ${quote.author}</cite>
    `;
}

// Fetch daily joke
function fetchJoke() {
    const jokeEl = document.getElementById('joke-content');
    if (!jokeEl) return;

    const jokes = [
        { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
        { setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!" },
        { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
        { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
        { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
        { setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts!" },
        { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese!" },
        { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!" },
        { setup: "What do you call a fish without eyes?", punchline: "A fsh!" },
        { setup: "Why can't you give Elsa a balloon?", punchline: "Because she will let it go!" }
    ];

    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    jokeEl.innerHTML = `
        <p class="joke-setup">${joke.setup}</p>
        <p class="joke-punchline">${joke.punchline}</p>
    `;
}

// Fetch daily suggestions - interesting websites that change daily
function fetchSuggestions() {
    const suggestionsEl = document.getElementById('suggestions-content');
    if (!suggestionsEl) return;

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
                    <div class="suggestion-info">
                        <a href="${s.url}" target="_blank">${s.text}</a>
                        <span class="suggestion-desc">${s.desc}</span>
                    </div>
                    <button class="save-suggestion-btn" data-text="${s.text}" data-url="${s.url}" data-desc="${s.desc}" title="Save to Saved Sites">+</button>
                </li>
            `).join('')}
        </ul>
    `;

    suggestionsEl.innerHTML = html;

    // Add click handlers for save buttons
    suggestionsEl.querySelectorAll('.save-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const site = {
                text: btn.dataset.text,
                url: btn.dataset.url,
                desc: btn.dataset.desc
            };
            saveSite(site);
            btn.textContent = '✓';
            btn.disabled = true;
            btn.classList.add('saved');
        });
    });
}

// Saved Sites functionality
let savedSitesEditMode = false;

function getSavedSites() {
    const saved = localStorage.getItem('savedSites');
    return saved ? JSON.parse(saved) : [];
}

function setSavedSites(sites) {
    localStorage.setItem('savedSites', JSON.stringify(sites));
}

function saveSite(site) {
    const sites = getSavedSites();
    // Check if already saved
    if (!sites.some(s => s.url === site.url)) {
        sites.push(site);
        setSavedSites(sites);
        renderSavedSites();
    }
}

function removeSavedSite(url) {
    const sites = getSavedSites().filter(s => s.url !== url);
    setSavedSites(sites);
    renderSavedSites();
}

function moveSavedSite(index, direction) {
    const sites = getSavedSites();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sites.length) return;

    [sites[index], sites[newIndex]] = [sites[newIndex], sites[index]];
    setSavedSites(sites);
    renderSavedSites();
}

function renderSavedSites() {
    const contentEl = document.getElementById('saved-sites-content');
    if (!contentEl) return;

    const sites = getSavedSites();

    if (sites.length === 0) {
        contentEl.innerHTML = '<p class="loading">No saved sites yet</p>';
        return;
    }

    if (savedSitesEditMode) {
        const html = `
            <ul class="saved-sites-list edit-mode">
                ${sites.map((s, i) => `
                    <li>
                        <div class="saved-site-reorder">
                            <button class="saved-site-move-btn" data-index="${i}" data-dir="up" ${i === 0 ? 'disabled' : ''}>↑</button>
                            <button class="saved-site-move-btn" data-index="${i}" data-dir="down" ${i === sites.length - 1 ? 'disabled' : ''}>↓</button>
                        </div>
                        <div class="suggestion-info">
                            <a href="${s.url}" target="_blank">${s.text}</a>
                            <span class="suggestion-desc">${s.desc}</span>
                        </div>
                        <button class="remove-saved-site-btn" data-url="${s.url}" title="Remove">×</button>
                    </li>
                `).join('')}
            </ul>
        `;
        contentEl.innerHTML = html;

        // Add event listeners for edit mode
        contentEl.querySelectorAll('.saved-site-move-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                moveSavedSite(parseInt(btn.dataset.index), btn.dataset.dir);
            });
        });

        contentEl.querySelectorAll('.remove-saved-site-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                removeSavedSite(btn.dataset.url);
            });
        });
    } else {
        const html = `
            <ul class="saved-sites-list">
                ${sites.map(s => `
                    <li>
                        <div class="suggestion-info">
                            <a href="${s.url}" target="_blank">${s.text}</a>
                            <span class="suggestion-desc">${s.desc}</span>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
        contentEl.innerHTML = html;
    }
}

function setupSavedSitesEdit() {
    const editBtn = document.getElementById('edit-saved-sites-btn');
    if (!editBtn) return;

    editBtn.addEventListener('click', () => {
        savedSitesEditMode = !savedSitesEditMode;
        editBtn.textContent = savedSitesEditMode ? 'Done' : 'Edit';
        editBtn.classList.toggle('btn-primary', savedSitesEditMode);
        editBtn.classList.toggle('btn-secondary', !savedSitesEditMode);
        renderSavedSites();
    });
}

// Fetch NHL standings
async function fetchNHLStandings() {
    const standingsEl = document.getElementById('nhl-standings');
    if (!standingsEl) return;

    try {
        const response = await fetch('https://api-web.nhle.com/v1/standings/now');
        if (!response.ok) throw new Error('NHL API failed');
        const data = await response.json();

        // Get top 8 teams by points
        const teams = data.standings
            .sort((a, b) => b.points - a.points)
            .slice(0, 8);

        const html = `
            <table class="nhl-standings-table">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>GP</th>
                        <th>W</th>
                        <th>L</th>
                        <th>PTS</th>
                    </tr>
                </thead>
                <tbody>
                    ${teams.map(team => `
                        <tr>
                            <td class="team-name">${team.teamAbbrev.default}</td>
                            <td>${team.gamesPlayed}</td>
                            <td>${team.wins}</td>
                            <td>${team.losses}</td>
                            <td class="points">${team.points}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <a href="https://www.nhl.com/standings" target="_blank" class="nhl-link">Full Standings</a>
        `;
        standingsEl.innerHTML = html;
    } catch (error) {
        console.error('NHL standings error:', error);
        // Show link to view standings on NHL.com
        standingsEl.innerHTML = `
            <p class="nhl-fallback-msg">Live standings require visiting NHL.com</p>
            <a href="https://www.nhl.com/standings" target="_blank" class="nhl-link nhl-link-primary">View NHL Standings</a>
        `;
    }
}

// Fetch Maple Leafs recent games
async function fetchLeafsGames() {
    const gamesEl = document.getElementById('leafs-games');
    if (!gamesEl) return;

    try {
        // Toronto Maple Leafs team abbreviation is TOR
        const response = await fetch('https://api-web.nhle.com/v1/club-schedule-season/TOR/now');
        if (!response.ok) throw new Error('Leafs API failed');
        const data = await response.json();

        // Get completed games and take last 5
        const completedGames = data.games
            .filter(game => game.gameState === 'OFF' || game.gameState === 'FINAL')
            .slice(-5)
            .reverse();

        if (completedGames.length === 0) {
            gamesEl.innerHTML = '<p class="loading">No recent games</p>';
            return;
        }

        const html = `
            <div class="leafs-games-list">
                ${completedGames.map(game => {
                    const isHome = game.homeTeam.abbrev === 'TOR';
                    const leafsScore = isHome ? game.homeTeam.score : game.awayTeam.score;
                    const oppScore = isHome ? game.awayTeam.score : game.homeTeam.score;
                    const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;
                    const result = leafsScore > oppScore ? 'W' : 'L';
                    const resultClass = result === 'W' ? 'win' : 'loss';
                    const gameDate = new Date(game.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const homeAway = isHome ? 'vs' : '@';

                    return `
                        <div class="leafs-game">
                            <span class="game-date">${gameDate}</span>
                            <span class="game-opponent">${homeAway} ${opponent}</span>
                            <span class="game-score">${leafsScore}-${oppScore}</span>
                            <span class="game-result ${resultClass}">${result}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <a href="https://www.nhl.com/mapleleafs/schedule" target="_blank" class="nhl-link">Full Schedule</a>
        `;
        gamesEl.innerHTML = html;
    } catch (error) {
        console.error('Leafs games error:', error);
        // Show link to view schedule on NHL.com
        gamesEl.innerHTML = `
            <p class="nhl-fallback-msg">Live scores require visiting NHL.com</p>
            <a href="https://www.nhl.com/mapleleafs/schedule" target="_blank" class="nhl-link nhl-link-primary">View Leafs Schedule</a>
        `;
    }
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
    fetchNHLStandings();
    fetchLeafsGames();
    renderSavedSites();
    setupSavedSitesEdit();
}

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
