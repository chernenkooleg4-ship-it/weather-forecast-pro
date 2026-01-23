// Stripe Configuration
const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY'); // Replace with your key
let isPremium = false;

// Translations
const translations = {
    en: {
        appTitle: "Weather Forecast Pro",
        getPremium: "🌟 Get Premium",
        enterCity: "Enter city name",
        search: "Search",
        useLocation: "📍 Use My Location",
        day: "Day",
        week: "Week",
        month: "Month 🔒",
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
        night: "Night",
        temperature: "Temperature",
        feelsLike: "Feels Like",
        humidity: "Humidity",
        windSpeed: "Wind Speed",
        pressure: "Pressure",
        precipitation: "Precipitation",
        uvIndex: "UV Index",
        visibility: "Visibility",
        upgradeTitle: "Upgrade to Premium",
        premiumFeatures: [
            "Extended 30-day forecast",
            "Hourly weather updates",
            "Advanced weather parameters",
            "No advertisements",
            "Priority support"
        ],
        subscribeNow: "Subscribe Now",
        monthlyPrice: "$9.99/month"
    },
    mk: {
        appTitle: "Временска прогноза Pro",
        getPremium: "🌟 Земи премиум",
        enterCity: "Внеси име на град",
        search: "Барај",
        useLocation: "📍 Користи ја мојата локација",
        day: "Ден",
        week: "Недела",
        month: "Месец 🔒",
        morning: "Утро",
        afternoon: "Попладне",
        evening: "Вечер",
        night: "Ноќ",
        temperature: "Температура",
        feelsLike: "Се чувствува како",
        humidity: "Влажност",
        windSpeed: "Брзина на ветер",
        pressure: "Притисок",
        precipitation: "Врнежи",
        uvIndex: "UV индекс",
        visibility: "Видливост",
        upgradeTitle: "Надгради на премиум",
        premiumFeatures: [
            "Проширена 30-дневна прогноза",
            "Часовни временски ажурирања",
            "Напредни временски параметри",
            "Без реклами",
            "Приоритетна поддршка"
        ],
        subscribeNow: "Претплати се сега",
        monthlyPrice: "$9.99/месец"
    },
    srb: {
        appTitle: "Временска прогноза Pro",
        getPremium: "🌟 Узми премиум",
        enterCity: "Унеси име града",
        search: "Претражи",
        useLocation: "📍 Користи моју локацију",
        day: "Дан",
        week: "Недеља",
        month: "Месец 🔒",
        morning: "Јутро",
        afternoon: "Поподне",
        evening: "Вече",
        night: "Ноћ",
        temperature: "Температура",
        feelsLike: "Осећај",
        humidity: "Влажност",
        windSpeed: "Брзина ветра",
        pressure: "Притисак",
        precipitation: "Падавине",
        uvIndex: "UV индекс",
        visibility: "Видљивост",
        upgradeTitle: "Надогради на премиум",
        premiumFeatures: [
            "Проширена 30-дневна прогноза",
            "Сатни временски ажурирања",
            "Напредни временски параметри",
            "Без реклама",
            "Приоритетна подршка"
        ],
        subscribeNow: "Претплати се сада",
        monthlyPrice: "$9.99/месец"
    }
};

let currentLang = 'en';
let currentPeriod = 'day';
let currentLocation = { lat: 40.7128, lon: -74.0060 }; // Default: New York

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadWeatherData();
});

function initializeEventListeners() {
    document.getElementById('language-selector').addEventListener('change', changeLanguage);
    document.getElementById('search-btn').addEventListener('click', searchCity);
    document.getElementById('location-btn').addEventListener('click', useCurrentLocation);
    document.getElementById('premium-btn').addEventListener('click', showPremiumModal);
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
    
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => changePeriod(e.target.dataset.period));
    });
    
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('premium-modal').style.display = 'none';
    });
    
    document.getElementById('city-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCity();
    });
}

function changeLanguage(e) {
    currentLang = e.target.value;
    updateUILanguage();
    loadWeatherData();
}

function updateUILanguage() {
    const t = translations[currentLang];
    document.getElementById('app-title').textContent = t.appTitle;
    document.getElementById('premium-btn').textContent = t.getPremium;
    document.getElementById('city-input').placeholder = t.enterCity;
    document.getElementById('search-btn').textContent = t.search;
    document.getElementById('location-btn').textContent = t.useLocation;
    document.getElementById('day-btn').textContent = t.day;
    document.getElementById('week-btn').textContent = t.week;
    document.getElementById('month-btn').textContent = t.month;
    document.getElementById('premium-title').textContent = t.upgradeTitle;
    document.getElementById('checkout-btn').textContent = t.subscribeNow;
    
    const featuresList = document.getElementById('premium-features-list');
    featuresList.innerHTML = t.premiumFeatures.map(f => `<li>${f}</li>`).join('');
}

async function searchCity() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) return;
    
    showLoading();
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const response = await fetch(geoUrl);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            currentLocation = {
                lat: data.results[0].latitude,
                lon: data.results[0].longitude,
                name: data.results[0].name
            };
            await loadWeatherData();
        } else {
            alert('City not found!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching location data');
    }
    hideLoading();
}

function useCurrentLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                await loadWeatherData();
                hideLoading();
            },
            (error) => {
                console.error('Error:', error);
                alert('Unable to get your location');
                hideLoading();
            }
        );
    }
}

async function loadWeatherData() {
    showLoading();
    try {
        const { lat, lon } = currentLocation;
        const forecastDays = isPremium && currentPeriod === 'month' ? 30 : 16;
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=${forecastDays}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        displayWeather(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching weather data');
    }
    hideLoading();
}

function displayWeather(data) {
    const container = document.getElementById('current-weather');
    const t = translations[currentLang];
    
    // Current weather
    const current = {
        temp: data.hourly.temperature_2m[0],
        feelsLike: data.hourly.apparent_temperature[0],
        humidity: data.hourly.relative_humidity_2m[0],
        windSpeed: data.hourly.wind_speed_10m[0],
        pressure: data.hourly.pressure_msl[0],
        precipitation: data.hourly.precipitation[0],
        uvIndex: data.hourly.uv_index[0]
    };
    
    container.innerHTML = `
        <div class="weather-main">
            <div>
                <h2>${currentLocation.name || 'Current Location'}</h2>
                <div class="temp-display">${Math.round(current.temp)}°C</div>
            </div>
        </div>
        <div class="weather-details">
            <div class="detail-item">
                <div class="detail-label">${t.feelsLike}</div>
                <div class="detail-value">${Math.round(current.feelsLike)}°C</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">${t.humidity}</div>
                <div class="detail-value">${current.humidity}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">${t.windSpeed}</div>
                <div class="detail-value">${Math.round(current.windSpeed)} km/h</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">${t.pressure}</div>
                <div class="detail-value">${Math.round(current.pressure)} hPa</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">${t.precipitation}</div>
                <div class="detail-value">${current.precipitation} mm</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">${t.uvIndex}</div>
                <div class="detail-value">${Math.round(current.uvIndex)}</div>
            </div>
        </div>
    `;
    
    displayForecast(data);
}

function displayForecast(data) {
    const container = document.getElementById('forecast-container');
    const t = translations[currentLang];
    
    if (currentPeriod === 'day') {
        // Day forecast by periods
        const periods = [
            { name: t.morning, hours: [6, 7, 8, 9, 10, 11] },
            { name: t.afternoon, hours: [12, 13, 14, 15, 16, 17] },
            { name: t.evening, hours: [18, 19, 20, 21, 22, 23] },
            { name: t.night, hours: [0, 1, 2, 3, 4, 5] }
        ];
        
        let html = '<div class="day-periods">';
        periods.forEach(period => {
            const avgTemp = period.hours.reduce((sum, h) => 
                sum + data.hourly.temperature_2m[h], 0) / period.hours.length;
            const avgWind = period.hours.reduce((sum, h) => 
                sum + data.hourly.wind_speed_10m[h], 0) / period.hours.length;
            
            html += `
                <div class="period-card">
                    <h3>${period.name}</h3>
                    <div class="period-temp">${Math.round(avgTemp)}°C</div>
                    <div>${t.windSpeed}: ${Math.round(avgWind)} km/h</div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
        
    } else if (currentPeriod === 'week') {
        // 7-day forecast
        let html = '<div class="week-forecast">';
        for (let i = 0; i < 7; i++) {
            const date = new Date(data.daily.time[i]);
            const dayName = date.toLocaleDateString(currentLang, { weekday: 'short' });
            
            html += `
                <div class="day-card">
                    <h3>${dayName}</h3>
                    <div class="period-temp">${Math.round(data.daily.temperature_2m_max[i])}°</div>
                    <div style="color: #666;">${Math.round(data.daily.temperature_2m_min[i])}°</div>
                    <div style="margin-top: 10px;">${t.windSpeed}: ${Math.round(data.daily.wind_speed_10m_max[i])} km/h</div>
                    <div>${t.precipitation}: ${data.daily.precipitation_sum[i]} mm</div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
        
    } else if (currentPeriod === 'month') {
        if (!isPremium) {
            showPremiumModal();
            return;
        }
        // 30-day forecast
        let html = '<div class="month-forecast">';
        for (let i = 0; i < Math.min(30, data.daily.time.length); i++) {
            const date = new Date(data.daily.time[i]);
            const dayName = date.toLocaleDateString(currentLang, { month: 'short', day: 'numeric' });
            
            html += `
                <div class="day-card">
                    <h3>${dayName}</h3>
                    <div class="period-temp">${Math.round(data.daily.temperature_2m_max[i])}°</div>
                    <div style="color: #666;">${Math.round(data.daily.temperature_2m_min[i])}°</div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    }
}

function changePeriod(period) {
    if (period === 'month' && !isPremium) {
        showPremiumModal();
        return;
    }
    
    currentPeriod = period;
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadWeatherData();
}

function showPremiumModal() {
    document.getElementById('premium-modal').style.display = 'block';
}

async function handleCheckout() {
    try {
        // Call your backend to create checkout session
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId: 'price_XXXXX' }) // Replace with your Stripe Price ID
        });
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });
        
        if (result.error) {
            alert(result.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing payment');
    }
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}
