// Weather Dashboard - Using Open-Meteo API (free, no API key required)

// DOM Elements
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const locationBtn = document.getElementById('location-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const weatherContent = document.getElementById('weather-content');
const initialState = document.getElementById('initial-state');

// Weather code to emoji mapping
const weatherIcons = {
  0: '☀️',   // Clear sky
  1: '🌤️',   // Mainly clear
  2: '⛅',   // Partly cloudy
  3: '☁️',   // Overcast
  45: '🌫️',  // Foggy
  48: '🌫️',  // Depositing rime fog
  51: '🌧️',  // Light drizzle
  53: '🌧️',  // Moderate drizzle
  55: '🌧️',  // Dense drizzle
  61: '🌧️',  // Slight rain
  63: '🌧️',  // Moderate rain
  65: '🌧️',  // Heavy rain
  71: '🌨️',  // Slight snow
  73: '🌨️',  // Moderate snow
  75: '❄️',   // Heavy snow
  77: '🌨️',  // Snow grains
  80: '🌦️',  // Slight rain showers
  81: '🌦️',  // Moderate rain showers
  82: '⛈️',   // Violent rain showers
  85: '🌨️',  // Slight snow showers
  86: '🌨️',  // Heavy snow showers
  95: '⛈️',   // Thunderstorm
  96: '⛈️',   // Thunderstorm with hail
  99: '⛈️'    // Thunderstorm with heavy hail
};

// Weather code to description mapping
const weatherDescriptions = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Moderate showers',
  82: 'Heavy showers',
  85: 'Light snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm'
};

// Initialize app
function init() {
  searchForm.addEventListener('submit', handleSearch);
  locationBtn.addEventListener('click', handleGeolocation);
  
  // Check for saved location
  const savedCity = localStorage.getItem('lastCity');
  if (savedCity) {
    cityInput.value = savedCity;
    searchCity(savedCity);
  }
}

// Handle search form submission
async function handleSearch(e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    await searchCity(city);
  }
}

// Search for a city
async function searchCity(cityName) {
  showLoading();
  
  try {
    // First, geocode the city name to get coordinates
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      showError('City not found. Please try another search.');
      return;
    }
    
    const location = geoData.results[0];
    const { latitude, longitude, name, country } = location;
    
    // Fetch weather data
    await fetchWeather(latitude, longitude, `${name}, ${country}`);
    
    // Save to localStorage
    localStorage.setItem('lastCity', cityName);
    
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to fetch weather data. Please try again.');
  }
}

// Handle geolocation
function handleGeolocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  
  showLoading();
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Reverse geocode to get city name
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
        );
        const geoData = await geoResponse.json();
        
        let cityName = 'Your Location';
        if (geoData.results && geoData.results.length > 0) {
          const loc = geoData.results[0];
          cityName = `${loc.name}, ${loc.country}`;
        }
        
        await fetchWeather(latitude, longitude, cityName);
        
      } catch (error) {
        console.error('Error:', error);
        showError('Failed to fetch weather data. Please try again.');
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      showError('Unable to get your location. Please search for a city instead.');
    }
  );
}

// Fetch weather data from Open-Meteo API
async function fetchWeather(lat, lon, cityName) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error('Weather API error');
    }
    
    const data = await response.json();
    displayWeather(data, cityName);
    
  } catch (error) {
    console.error('Error fetching weather:', error);
    showError('Failed to fetch weather data. Please try again.');
  }
}

// Display weather data
function displayWeather(data, cityName) {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;
  
  // Current weather
  document.getElementById('city-name').textContent = cityName;
  document.getElementById('temp-value').textContent = Math.round(current.temperature_2m);
  document.getElementById('weather-icon').textContent = weatherIcons[current.weather_code] || '🌡️';
  document.getElementById('weather-desc').textContent = weatherDescriptions[current.weather_code] || 'Unknown';
  document.getElementById('date-time').textContent = formatDateTime(new Date());
  
  // Weather details
  document.getElementById('wind-speed').textContent = `${current.wind_speed_10m} km/h`;
  document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}°C`;
  document.getElementById('cloud-cover').textContent = `${current.cloud_cover}%`;
  
  // Hourly forecast (next 24 hours)
  const hourlyContainer = document.getElementById('hourly-forecast');
  const currentHour = new Date().getHours();
  let hourlyHTML = '';
  
  for (let i = 0; i < 24; i++) {
    const hourIndex = currentHour + i;
    if (hourIndex < hourly.time.length) {
      const time = new Date(hourly.time[hourIndex]);
      const temp = Math.round(hourly.temperature_2m[hourIndex]);
      const icon = weatherIcons[hourly.weather_code[hourIndex]] || '🌡️';
      
      hourlyHTML += `
        <div class="hourly-item">
          <span class="hourly-time">${i === 0 ? 'Now' : formatHour(time)}</span>
          <span class="hourly-icon">${icon}</span>
          <span class="hourly-temp">${temp}°</span>
        </div>
      `;
    }
  }
  hourlyContainer.innerHTML = hourlyHTML;
  
  // Daily forecast
  const dailyContainer = document.getElementById('daily-forecast');
  let dailyHTML = '';
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(daily.time[i]);
    const icon = weatherIcons[daily.weather_code[i]] || '🌡️';
    const desc = weatherDescriptions[daily.weather_code[i]] || 'Unknown';
    const high = Math.round(daily.temperature_2m_max[i]);
    const low = Math.round(daily.temperature_2m_min[i]);
    
    dailyHTML += `
      <div class="daily-item">
        <span class="daily-day">${i === 0 ? 'Today' : formatDay(date)}</span>
        <span class="daily-icon">${icon}</span>
        <span class="daily-desc">${desc}</span>
        <div class="daily-temps">
          <span class="daily-high">${high}°</span>
          <span class="daily-low">${low}°</span>
        </div>
      </div>
    `;
  }
  dailyContainer.innerHTML = dailyHTML;
  
  // Show weather content
  hideLoading();
  hideError();
  initialState.classList.add('hidden');
  weatherContent.classList.add('visible');
}

// Helper functions
function formatDateTime(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatHour(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  });
}

function formatDay(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short'
  });
}

// UI State functions
function showLoading() {
  loadingEl.classList.add('visible');
  weatherContent.classList.remove('visible');
  errorEl.classList.remove('visible');
  initialState.classList.add('hidden');
}

function hideLoading() {
  loadingEl.classList.remove('visible');
}

function showError(message) {
  hideLoading();
  errorMessage.textContent = message;
  errorEl.classList.add('visible');
  weatherContent.classList.remove('visible');
}

function hideError() {
  errorEl.classList.remove('visible');
}

// Initialize the app
init();

console.log('🌤️ Weather Dashboard loaded successfully!');