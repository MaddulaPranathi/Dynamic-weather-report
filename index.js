                const API_KEY = '031c7abe3e5da73792e504ab7c3ca7b5'; 
        
                // DOM Elements
                const cityInput = document.getElementById('city-input');
                const searchButton = document.getElementById('search-button');
                const loadingIndicator = document.getElementById('loading-indicator');
                const errorMessage = document.getElementById('error-message');
                const currentWeatherSection = document.getElementById('current-weather');
                const forecastSection = document.getElementById('forecast-section');
                const cityNameElement = document.getElementById('city-name');
                const dateElement = document.getElementById('date');
                const descriptionElement = document.getElementById('description');
                const weatherIconElement = document.getElementById('weather-icon');
                const temperatureElement = document.getElementById('temperature');
                const humidityElement = document.getElementById('humidity');
                const windSpeedElement = document.getElementById('wind-speed');
                const forecastContainer = document.getElementById('forecast-container');
        
                // Helper function to convert Kelvin to Celsius
                function kelvinToCelsius(kelvin) {
                    return (kelvin - 273.15).toFixed(0); // Round to nearest integer
                }
        
                // Helper function to format date
                function formatDate(timestamp) {
                    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    return date.toLocaleDateString('en-US', options);
                }
        
                // Helper function to format forecast date (e.g., Mon, Jul 29)
                function formatForecastDate(timestamp) {
                    const date = new Date(timestamp * 1000);
                    const options = { weekday: 'short', month: 'short', day: 'numeric' };
                    return date.toLocaleDateString('en-US', options);
                }
        
                // Function to display error message
                function displayError(message = 'Oops! Could not find weather data for that location. Please try again.') {
                    errorMessage.querySelector('p').textContent = message;
                    errorMessage.classList.remove('hidden');
                    loadingIndicator.classList.add('hidden');
                    currentWeatherSection.classList.add('hidden');
                    forecastSection.classList.add('hidden');
                    currentWeatherSection.classList.remove('active'); // Remove animation class
                    forecastSection.classList.remove('active'); // Remove animation class
                }
        
                // Function to hide all display sections and show loading
                function showLoading() {
                    loadingIndicator.classList.remove('hidden');
                    errorMessage.classList.add('hidden');
                    currentWeatherSection.classList.add('hidden');
                    forecastSection.classList.add('hidden');
                    currentWeatherSection.classList.remove('active'); // Remove animation class
                    forecastSection.classList.remove('active'); // Remove animation class
                }
        
                // Function to fetch weather data
                async function fetchWeatherData(query) {
                    showLoading();
        
                    try {
                        let currentWeatherData;
                        let forecastData;
        
                        if (query.toLowerCase() === 'current location') {
                            // Get user's current location
                            const position = await new Promise((resolve, reject) => {
                                navigator.geolocation.getCurrentPosition(resolve, reject);
                            });
                            const { latitude, longitude } = position.coords;
        
                            // Fetch current weather by coordinates
                            const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
                            if (!currentWeatherResponse.ok) throw new Error('Current weather fetch failed');
                            currentWeatherData = await currentWeatherResponse.json();
        
                            // Fetch forecast by coordinates
                            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
                            if (!forecastResponse.ok) throw new Error('Forecast fetch failed');
                            forecastData = await forecastResponse.json();
        
                        } else {
                            // Fetch current weather by city name
                            const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}`);
                            if (!currentWeatherResponse.ok) throw new Error('Current weather fetch failed');
                            currentWeatherData = await currentWeatherResponse.json();
        
                            // Fetch forecast by city name
                            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${API_KEY}`);
                            if (!forecastResponse.ok) throw new Error('Forecast fetch failed');
                            forecastData = await forecastResponse.json();
                        }
        
                        // Display current weather
                        displayCurrentWeather(currentWeatherData);
        
                        // Display 3-day forecast
                        displayForecast(forecastData);
        
                        loadingIndicator.classList.add('hidden');
                        currentWeatherSection.classList.remove('hidden');
                        forecastSection.classList.remove('hidden');
        
                        // Trigger fade-in animation
                        setTimeout(() => {
                            currentWeatherSection.classList.add('active');
                            forecastSection.classList.add('active');
                        }, 100); // Small delay to ensure hidden is applied first
        
                    } catch (error) {
                        console.error('Error fetching weather data:', error);
                        if (error.code === error.PERMISSION_DENIED) {
                            displayError('Geolocation permission denied. Please enter a city name manually.');
                        } else if (error.message.includes('Current weather fetch failed') || error.message.includes('Forecast fetch failed')) {
                            displayError('City not found or API error. Please check the city name.');
                        } else {
                            displayError();
                        }
                    }
                }
        
                // Function to display current weather
                function displayCurrentWeather(data) {
                    cityNameElement.textContent = data.name + ', ' + data.sys.country;
                    dateElement.textContent = formatDate(data.dt);
                    descriptionElement.textContent = data.weather[0].description;
                    weatherIconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                    temperatureElement.textContent = kelvinToCelsius(data.main.temp);
                    humidityElement.textContent = data.main.humidity;
                    windSpeedElement.textContent = data.wind.speed;
                }
        
                // Function to display 3-day forecast
                function displayForecast(data) {
                    forecastContainer.innerHTML = ''; // Clear previous forecast
        
                    const dailyForecasts = {}; // To store one entry per day
        
                    // Filter for unique days and select one entry per day (e.g., around noon)
                    data.list.forEach(item => {
                        const date = new Date(item.dt * 1000);
                        const dayKey = date.toDateString(); // e.g., "Mon Jul 29 2024"
        
                        // Only consider entries for the next 3 full days, starting from tomorrow
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Reset time to compare dates only
        
                        const itemDate = new Date(item.dt * 1000);
                        itemDate.setHours(0, 0, 0, 0);
        
                        // Calculate difference in days
                        const diffTime = Math.abs(itemDate - today);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
                        // We want the next 3 days, so diffDays should be 1, 2, or 3 (tomorrow, day after, day after that)
                        if (diffDays >= 1 && diffDays <= 3) {
                            // If we haven't added this day yet, or if this entry is closer to noon (12:00 UTC)
                            // we'll pick it. This is a simple heuristic.
                            if (!dailyForecasts[dayKey]) {
                                dailyForecasts[dayKey] = item;
                            } else {
                                const existingHour = new Date(dailyForecasts[dayKey].dt * 1000).getUTCHours();
                                const newHour = new Date(item.dt * 1000).getUTCHours();
                                if (Math.abs(newHour - 12) < Math.abs(existingHour - 12)) {
                                    dailyForecasts[dayKey] = item;
                                }
                            }
                        }
                    });
        
                    // Convert object to array and sort by date
                    const sortedForecasts = Object.values(dailyForecasts).sort((a, b) => a.dt - b.dt);
        
                    sortedForecasts.slice(0, 3).forEach(item => { // Ensure only 3 days are displayed
                        const forecastCard = document.createElement('div');
                        forecastCard.classList.add('forecast-card', 'flex', 'flex-col', 'items-center', 'text-center');
        
                        forecastCard.innerHTML = `
                            <p class="text-lg font-semibold text-gray-800 mb-1">${formatForecastDate(item.dt)}</p>
                            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Weather Icon" class="w-20 h-20">
                            <p class="text-2xl font-bold text-gray-900 mt-1">${kelvinToCelsius(item.main.temp)}&deg;C</p>
                            <p class="text-gray-700 capitalize text-base">${item.weather[0].description}</p>
                        `;
                        forecastContainer.appendChild(forecastCard);
                    });
                }
        
                // Event listener for search button click
                searchButton.addEventListener('click', () => {
                    const city = cityInput.value.trim();
                    if (city) {
                        fetchWeatherData(city);
                    } else {
                        displayError('Please enter a city name.');
                    }
                });
        
                // Event listener for Enter key press in input field
                cityInput.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        searchButton.click();
                    }
                });
        
                // Auto-fetch weather for current location on page load
                window.onload = () => {
                    // Check if API_KEY is set
                    if (API_KEY === 'YOUR_API_KEY' || API_KEY === '') {
                        displayError('Please replace "YOUR_API_KEY" in the JavaScript code with your actual OpenWeatherMap API key.');
                        return;
                    }
                    cityInput.value = 'current location';
                    fetchWeatherData('current location');
                };