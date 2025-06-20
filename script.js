// ===== Theme Toggle Logic =====
const themeToggleBtn = document.getElementById("themeToggle");
const htmlElement = document.documentElement;

// Load saved theme on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  htmlElement.setAttribute("data-theme", savedTheme);
  updateToggleIcon(savedTheme);
});

// Handle button click
themeToggleBtn.addEventListener("click", () => {
  const currentTheme = htmlElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  htmlElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateToggleIcon(newTheme);
});

// Update toggle icon based on theme
function updateToggleIcon(theme) {
  themeToggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
}

// ===== Weather App Logic =====

// API & DOM Elements
const apiKey = '247114cf56c39bb65311e3611c767a81';
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const notFoundSection = document.querySelector('.not-found');
const weatherInfoSection = document.querySelector('.weather-info');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const currentDateTxt = document.querySelector('.current-date-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');

const forecastContainer = document.querySelector('.forecast-items-container');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', e => e.key === 'Enter' && handleSearch());

function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) return;
  updateWeather(city);
  cityInput.value = '';
  cityInput.blur();
}

// Fetch Function
async function fetchData(endpoint, city) {
  const url = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

// Main Function
async function updateWeather(city) {
  try {
    const current = await fetchData('weather', city);
    const forecastData = await fetchData('forecast', city);

    // Current Weather Info
    const {
      name,
      main: { temp, humidity },
      weather: [{ main: cond, icon }],
      wind: { speed }
    } = current;

    countryTxt.textContent = name;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    conditionTxt.textContent = cond;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${speed} m/s`;
    weatherSummaryImg.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherSummaryImg.alt = cond;

    currentDateTxt.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short'
    });

    // 5-Day Forecast
    const daily = {};
    forecastData.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      const existing = daily[date];
      if (!existing || item.dt > existing.dt) {
        daily[date] = item;
      }
    });

    // Build forecast items
    forecastContainer.innerHTML = '';
    Object.values(daily).slice(1, 6).forEach(item => {
      const date = new Date(item.dt_txt).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric'
      });
      const icon = item.weather[0].icon;
      const temp = Math.round(item.main.temp);

      forecastContainer.innerHTML += `
        <div class="forecast-item">
          <h5 class="forecast-item-date regular-txt">${date}</h5>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" class="forecast-item-img" alt="${item.weather[0].main}">
          <h5 class="forecast-item-temp">${temp} °C</h5>
        </div>`;
    });

    showDisplaySection(weatherInfoSection);
  } catch (err) {
    showDisplaySection(notFoundSection);
    console.error(err);
  }
}

// Utility
function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection].forEach(s => s.style.display = 'none');
  section.style.display = 'flex';
}
