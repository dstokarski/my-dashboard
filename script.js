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

// Weather Data using Open-Meteo API - Editorial Style
async function fetchWeather(lat, lon, elementId, wundergroundUrl, cityName) {
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
        const lowTemp = Math.round(daily.temperature_2m_min[0]);

        let forecastHTML = '';
        for (let i = 1; i < 5; i++) {
            const date = new Date(daily.time[i]);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);

            forecastHTML += `
                <div class="forecast-day">
                    <div class="forecast-day-name">${dayName}</div>
                    <div class="forecast-temp">${maxTemp}°/${minTemp}°</div>
                </div>
            `;
        }

        const weatherHTML = `
            <div class="weather-temp-big">${temp}°</div>
            <div class="weather-city">${cityName}</div>
            <div class="weather-desc">${weatherDesc}</div>
            <div class="weather-grid">
                <div class="w-cell">
                    <div class="w-label">Humidity</div>
                    <div class="w-val">${humidity}%</div>
                </div>
                <div class="w-cell">
                    <div class="w-label">Wind</div>
                    <div class="w-val">${windSpeed} km/h</div>
                </div>
                <div class="w-cell">
                    <div class="w-label">Low</div>
                    <div class="w-val">${lowTemp}°C</div>
                </div>
                <div class="w-cell">
                    <div class="w-label">Condition</div>
                    <div class="w-val">${weatherDesc}</div>
                </div>
            </div>
            <div class="weather-forecast-row">
                ${forecastHTML}
            </div>
            <a href="${wundergroundUrl}" target="_blank" class="weather-link">View Full Forecast →</a>
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

// Check if user is signed in
function isUserSignedIn() {
    // Check both the currentUser variable from firebase-manager.js and Firebase auth
    return (typeof currentUser !== 'undefined' && currentUser !== null) ||
           (window.firebase && window.firebase.auth && window.firebase.auth.auth && window.firebase.auth.auth.currentUser);
}

// Curated suggestions list - expanded for variety
const CURATED_SUGGESTIONS = [
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
    { text: "The School of Life", url: "https://www.theschooloflife.com", desc: "Emotional education" },
    { text: "Letters of Note", url: "https://lettersofnote.com", desc: "Historic letters" },
    { text: "Mental Floss", url: "https://www.mentalfloss.com", desc: "Fun facts and trivia" },
    { text: "TED Ideas", url: "https://ideas.ted.com", desc: "Ideas worth spreading" },
    { text: "Pocket Worthy", url: "https://getpocket.com/explore", desc: "Curated reads" },
    { text: "Farnam Street", url: "https://fs.blog", desc: "Mental models" },
    { text: "Quanta Magazine", url: "https://www.quantamagazine.org", desc: "Math and science" },
    { text: "The Conversation", url: "https://theconversation.com", desc: "Academic insights" },
    { text: "Longreads", url: "https://longreads.com", desc: "Long-form stories" },
    { text: "The Browser", url: "https://thebrowser.com", desc: "Writing worth reading" },
    { text: "Damn Interesting", url: "https://www.damninteresting.com", desc: "Fascinating true stories" },
    { text: "Lapham's Quarterly", url: "https://www.laphamsquarterly.org", desc: "History and literature" },
    { text: "Public Domain Review", url: "https://publicdomainreview.org", desc: "Curious works" },
    { text: "Knowable Magazine", url: "https://knowablemagazine.org", desc: "Science journalism" },
    { text: "Psyche", url: "https://psyche.co", desc: "Psychology insights" },
    { text: "Rest of World", url: "https://restofworld.org", desc: "Global tech stories" },
    { text: "Works in Progress", url: "https://worksinprogress.co", desc: "Progress studies" },
    { text: "Asterisk Magazine", url: "https://asteriskmag.com", desc: "Effective ideas" },
    { text: "Noema Magazine", url: "https://www.noemamag.com", desc: "Ideas shaping our world" },
    { text: "Slate Star Codex", url: "https://slatestarcodex.com", desc: "Rationalist essays" },
    { text: "LessWrong", url: "https://www.lesswrong.com", desc: "Rationality community" },
    { text: "Gwern.net", url: "https://gwern.net", desc: "Essays and research" },
    { text: "Marginal Revolution", url: "https://marginalrevolution.com", desc: "Economics blog" },
    { text: "Overcoming Bias", url: "https://www.overcomingbias.com", desc: "Contrarian ideas" },
    { text: "Art of Manliness", url: "https://www.artofmanliness.com", desc: "Life skills" },
    { text: "Cool Tools", url: "https://kk.org/cooltools", desc: "Useful things" },
    { text: "Kottke", url: "https://kottke.org", desc: "Eclectic links" },
    { text: "Boing Boing", url: "https://boingboing.net", desc: "Tech and culture" },
    { text: "Metafilter", url: "https://www.metafilter.com", desc: "Best of the web" }
];

// Suggestions state - persisted in localStorage
let currentSuggestionSeed = null;

// Get or initialize the suggestion seed (only changes when user clicks refresh)
function getSuggestionSeed() {
    if (currentSuggestionSeed !== null) {
        return currentSuggestionSeed;
    }

    const stored = localStorage.getItem('suggestionSeed');
    if (stored) {
        currentSuggestionSeed = parseInt(stored, 10);
    } else {
        // Initialize with current timestamp
        currentSuggestionSeed = Date.now();
        localStorage.setItem('suggestionSeed', currentSuggestionSeed.toString());
    }
    return currentSuggestionSeed;
}

// Generate new seed when user clicks refresh
function refreshSuggestionSeed() {
    currentSuggestionSeed = Date.now();
    localStorage.setItem('suggestionSeed', currentSuggestionSeed.toString());
    // Clear HN cache to get fresh stories
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hn_stories_')) {
            localStorage.removeItem(key);
        }
    });
    return currentSuggestionSeed;
}

// Seeded random number generator for consistent results
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Fetch top stories from Hacker News
async function fetchHackerNewsStories() {
    const seed = getSuggestionSeed();
    const cacheKey = `hn_stories_${seed}`;
    const cached = localStorage.getItem(cacheKey);

    // Return cached data if available for this seed
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    try {
        // Fetch top story IDs
        const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = await response.json();

        // Use seed to select which stories to fetch
        const startIndex = (seed % 100);
        const selectedIds = storyIds.slice(startIndex, startIndex + 10);

        // Fetch story details
        const stories = await Promise.all(
            selectedIds.map(async (id) => {
                const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                return storyResponse.json();
            })
        );

        // Filter and format stories (only those with URLs)
        const formattedStories = stories
            .filter(story => story && story.url && story.title)
            .slice(0, 5)
            .map(story => ({
                text: story.title.length > 50 ? story.title.substring(0, 47) + '...' : story.title,
                url: story.url,
                desc: `HN: ${story.score} points`,
                source: 'hn'
            }));

        // Cache for this seed
        localStorage.setItem(cacheKey, JSON.stringify(formattedStories));

        return formattedStories;
    } catch (error) {
        console.error('Error fetching Hacker News:', error);
        return [];
    }
}

// Get curated suggestions based on current seed
function getCuratedSuggestions(count = 3) {
    const seed = getSuggestionSeed();

    // Create shuffled copy using seeded random
    const shuffled = [...CURATED_SUGGESTIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count).map(s => ({ ...s, source: 'curated' }));
}

// Fetch suggestions - mix of curated sites and Hacker News
async function fetchSuggestions(forceRefresh = false) {
    const suggestionsEl = document.getElementById('suggestions-content');
    if (!suggestionsEl) return;

    // Generate new seed if refreshing
    if (forceRefresh) {
        refreshSuggestionSeed();
    }

    // Show loading state
    suggestionsEl.innerHTML = '<p class="loading">Loading suggestions...</p>';

    try {
        // Get curated suggestions (3) and HN stories (2)
        const [hnStories] = await Promise.all([
            fetchHackerNewsStories()
        ]);

        const curatedSuggestions = getCuratedSuggestions(3);
        const hnSuggestions = hnStories.slice(0, 2);

        // Combine: curated first, then HN
        const dailySuggestions = [...curatedSuggestions, ...hnSuggestions];

        // If HN failed, fill with more curated
        if (dailySuggestions.length < 5) {
            const moreCurated = getCuratedSuggestions(5).slice(dailySuggestions.length);
            dailySuggestions.push(...moreCurated);
        }

        renderSuggestions(dailySuggestions.slice(0, 5));
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Fallback to curated only
        const curatedSuggestions = getCuratedSuggestions(5);
        renderSuggestions(curatedSuggestions);
    }
}

// Render suggestions to the DOM
function renderSuggestions(suggestions) {
    const suggestionsEl = document.getElementById('suggestions-content');
    if (!suggestionsEl) return;

    const signedIn = isUserSignedIn();

    const html = `
        <ul class="suggestions-list">
            ${suggestions.map(s => `
                <li>
                    <div class="suggestion-info">
                        <a href="${s.url}" target="_blank">${s.text}</a>
                        <span class="suggestion-desc">${s.desc}${s.source === 'hn' ? ' <span class="hn-badge">HN</span>' : ''}</span>
                    </div>
                    ${signedIn ? `<button class="save-suggestion-btn" data-text="${escapeHtml(s.text)}" data-url="${escapeHtml(s.url)}" data-desc="${escapeHtml(s.desc)}" title="Save to Saved Sites">+</button>` : ''}
                </li>
            `).join('')}
        </ul>
    `;

    suggestionsEl.innerHTML = html;

    // Add click handlers for save buttons (only if signed in)
    if (signedIn) {
        suggestionsEl.querySelectorAll('.save-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const site = {
                    text: btn.dataset.text,
                    url: btn.dataset.url,
                    desc: btn.dataset.desc
                };
                btn.textContent = '...';
                btn.disabled = true;
                await saveSite(site);
                btn.textContent = '✓';
                btn.classList.add('saved');
            });
        });
    }
}

// Helper to escape HTML in data attributes
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Saved Sites functionality - uses Firebase when signed in, localStorage as fallback
let savedSitesEditMode = false;
let cachedSavedSites = [];

async function getSavedSites() {
    // Check if Firebase is available and user is signed in
    if (window.firebase && isUserSignedIn()) {
        try {
            const sitesRef = window.firebase.db.ref(window.firebase.db.database, 'savedSites');
            const snapshot = await window.firebase.db.get(sitesRef);
            if (snapshot.exists()) {
                cachedSavedSites = snapshot.val();
                return cachedSavedSites;
            }
            return [];
        } catch (error) {
            console.error('Error loading saved sites from Firebase:', error);
            return [];
        }
    }
    // Fallback to localStorage if not signed in
    const saved = localStorage.getItem('savedSites');
    return saved ? JSON.parse(saved) : [];
}

async function setSavedSites(sites) {
    cachedSavedSites = sites;
    // Save to Firebase if signed in
    if (window.firebase && isUserSignedIn()) {
        try {
            const sitesRef = window.firebase.db.ref(window.firebase.db.database, 'savedSites');
            await window.firebase.db.set(sitesRef, sites);
            console.log('Saved sites to Firebase:', sites.length, 'sites');
        } catch (error) {
            console.error('Error saving sites to Firebase:', error);
        }
    } else {
        console.log('User not signed in, saving to localStorage only');
    }
    // Also save to localStorage as backup
    localStorage.setItem('savedSites', JSON.stringify(sites));
}

async function saveSite(site) {
    const sites = await getSavedSites();
    // Check if already saved
    if (!sites.some(s => s.url === site.url)) {
        sites.push(site);
        await setSavedSites(sites);
        await renderSavedSites();
    }
}

async function removeSavedSite(url) {
    const sites = (await getSavedSites()).filter(s => s.url !== url);
    await setSavedSites(sites);
    await renderSavedSites();
}

async function moveSavedSite(index, direction) {
    const sites = await getSavedSites();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sites.length) return;

    [sites[index], sites[newIndex]] = [sites[newIndex], sites[index]];
    await setSavedSites(sites);
    await renderSavedSites();
}

async function renderSavedSites() {
    const contentEl = document.getElementById('saved-sites-content');
    if (!contentEl) return;

    const sites = await getSavedSites();

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
                            <span class="suggestion-desc">${s.desc || ''}</span>
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
                            <span class="suggestion-desc">${s.desc || ''}</span>
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

    // Initially hide/show based on sign-in status
    editBtn.style.display = isUserSignedIn() ? 'inline-flex' : 'none';

    editBtn.addEventListener('click', () => {
        savedSitesEditMode = !savedSitesEditMode;
        editBtn.textContent = savedSitesEditMode ? 'Done' : 'Edit';
        editBtn.classList.toggle('btn-primary', savedSitesEditMode);
        editBtn.classList.toggle('btn-secondary', !savedSitesEditMode);
        renderSavedSites();
    });
}

// Update UI elements based on sign-in status (called when auth state changes)
function updateSavedSitesUI() {
    const editBtn = document.getElementById('edit-saved-sites-btn');
    if (editBtn) {
        editBtn.style.display = isUserSignedIn() ? 'inline-flex' : 'none';
        // Reset edit mode when signing out
        if (!isUserSignedIn()) {
            savedSitesEditMode = false;
            editBtn.textContent = 'Edit';
            editBtn.classList.remove('btn-primary');
            editBtn.classList.add('btn-secondary');
        }
    }
    // Re-render suggestions to show/hide save buttons
    fetchSuggestions();
    // Re-render saved sites
    renderSavedSites();
}

// Initialize
function init() {
    // Update time immediately and every second
    updateTime();
    setInterval(updateTime, 1000);

    // Fetch weather for Ottawa and Chelsea
    fetchWeather(45.4215, -75.6972, 'weather-ottawa', 'https://www.wunderground.com/forecast/ca/ottawa', 'Ottawa, Ontario');
    fetchWeather(45.5, -75.8, 'weather-chelsea', 'https://www.wunderground.com/forecast/ca/chelsea', 'Chelsea, Québec');

    // Refresh weather every 15 minutes
    setInterval(() => {
        fetchWeather(45.4215, -75.6972, 'weather-ottawa', 'https://www.wunderground.com/forecast/ca/ottawa', 'Ottawa, Ontario');
        fetchWeather(45.5, -75.8, 'weather-chelsea', 'https://www.wunderground.com/forecast/ca/chelsea', 'Chelsea, Québec');
    }, 15 * 60 * 1000);

    // Load static card content
    fetchPhotos();
    fetchQuote();
    fetchJoke();
    fetchSuggestions();
    renderSavedSites();
    setupSavedSitesEdit();
    setupSuggestionsRefresh();
}

// Setup refresh button for suggestions
function setupSuggestionsRefresh() {
    const refreshBtn = document.getElementById('refresh-suggestions-btn');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.textContent = '...';
        await fetchSuggestions(true); // true = force refresh
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
    });
}

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
