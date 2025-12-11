const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherData = async (city) => {
    if (!API_KEY || API_KEY.includes('YOUR_API_KEY')) {
        console.warn('No API Key found, returning mock data');
        return getMockData(city);
    }

    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city},BO&units=metric&appid=${API_KEY}`);

        if (response.status === 401) {
            console.warn('API Key unauthorized (401). It might not be activated yet. Returning mock data.');
            return getMockData(city);
        }

        if (!response.ok) throw new Error('Failed to fetch weather data');
        return await response.json();
    } catch (error) {
        console.error(error);
        return getMockData(city);
    }
};

export const getForecastData = async (city) => {
    if (!API_KEY || API_KEY.includes('YOUR_API_KEY')) {
        return getMockForecast(city);
    }
    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city},BO&units=metric&appid=${API_KEY}`);

        if (response.status === 401) {
            console.warn('API Key unauthorized (401). It might not be activated yet. Returning mock data.');
            return getMockForecast(city);
        }

        if (!response.ok) throw new Error('Failed to fetch forecast data');
        return await response.json();
    } catch (error) {
        console.error(error);
        return getMockForecast(city);
    }
}

const getMockData = (city) => ({
    name: city,
    main: { temp: 22, humidity: 60, pressure: 1015 },
    weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
    wind: { speed: 5 },
    isMock: true
});

const getMockForecast = (city) => ({
    list: Array(5).fill(0).map((_, i) => ({
        dt: Date.now() / 1000 + i * 86400,
        main: { temp: 20 + i, humidity: 50 + i * 2 },
        weather: [{ main: 'Clouds', icon: '02d' }]
    })),
    isMock: true
})
