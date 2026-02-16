const cityName=document.querySelector('#city-name-date');
const temperature=document.querySelector('#temperature');
const humidity=document.querySelector('#Humidity');
const windSpeed=document.querySelector('#Wind-Speed');
const forecastContainer=document.querySelector('#forecast-container');
// const rainChance=document.querySelector('#Rain-chance');
// const AQI=document.querySelector('#AQI');
const searchFormE1=document.querySelector('#search-form');
const searchInputE1=document.querySelector('#search-input');
const loaderE1=document.querySelector("#loader");
const errorContainerE1=document.querySelector("#error-container");
const historyContainerE1=document.querySelector('#history-container');

//remove special symbol
function normalizeCityName(name){
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


function displayCurrentWeather(data){
    const currentDate=new Date().toLocaleDateString('en-GB');
    const cleanName = normalizeCityName(data.name);
    cityName.textContent=`${cleanName} (${currentDate})`;
    temperature.textContent=`Temperature: ${Math.round(data.main.temp)}°C `;
    humidity.textContent=`Humidity: ${data.main.humidity}%`;
    windSpeed.textContent=`Wind Speed: ${data.wind.speed}Km/h`;
}

function displayForecast(forecastList){
    // forecastContainer.innnerHTML='';
   for(let i=0; i<forecastList.length; i+=8){
        const dailyForecast=forecastList[i];
        console.log("Daily forecast data", dailyForecast);

        const card=document.createElement('div');
        card.classList.add('forecast-card');
        
        const date=new Date(dailyForecast.dt_txt);
        const dateEl=document.createElement('h3');
        dateEl.textContent=date.toLocaleDateString('en-GB');
        
        const iconCode=dailyForecast.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        const iconEl=document.createElement('img');
        iconEl.setAttribute('src',iconUrl);
        iconEl.setAttribute('alt', dailyForecast.weather[0].description);//if image not load alt

        const tempEl=document.createElement('p');
        tempEl.textContent=`Temp: ${Math.round(dailyForecast.main.temp)} °C`;

        const humidityEl=document.createElement('p');
        humidityEl.textContent = `Humidity: ${dailyForecast.main.humidity}%`;
        
        card.append(dateEl, iconEl, tempEl, humidityEl);

        forecastContainer.append(card);

   }    
}

function renderHistory(){
    const history=JSON.parse(localStorage.getItem('weatherHistory') || '[]');
    historyContainerE1.innerHTML='';
    for(const city of history){
        const historyBtn=document.createElement('button');
        cleanName=normalizeCityName(city);
        historyBtn.textContent=cleanName;
        historyBtn.classList.add('history-btn');
        historyBtn.setAttribute('data-city',city);
        historyContainerE1.append(historyBtn);
    }
}

// @param {string}
function saveHistory(city){
    let historyString=localStorage.getItem('weatherHistory');
    if(historyString===null){
        historyString='[]';
    }
    let history=JSON.parse(historyString);
    //avoid duplicate
    let newHistory=[];
    for(let i=0; i<history.length; i++){
        let existingCity = history[i];
        if (existingCity.toLowerCase() !== city.toLowerCase()) {
            newHistory.push(existingCity);
        }
    }
    //place the new city at top
    newHistory.unshift(city);
    
    if(newHistory.length >10){
        newHistory=newHistory.slice(0,10);
    }
    localStorage.setItem('weatherHistory', JSON.stringify(newHistory));
    renderHistory();
}

const API_KEY='apikey';

//fetching data
async function fetchWeather(city){
    //url query string
    try{
        errorContainerE1.classList.add('hidden');
        cityName.textContent = '';
        temperature.textContent = '';
        humidity.textContent = '';
        windSpeed.textContent = '';
        forecastContainer.innerHTML = '';

        loaderE1.classList.remove('hidden');
        const currentWeatherUrl=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
        
        //metadata of request and metadata
        const responses=await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);
        for(const response of responses){
            if(!response.ok){
                throw new Error("City not found or API error");
            }
        }
    
        const currentWeather=await responses[0].json();
        const forecast=await responses[1].json();

        displayCurrentWeather(currentWeather);
        displayForecast(forecast.list);
        saveHistory(currentWeather.name);
    }
    catch(error){
        console.error("failed to fetch weather data: ", error);
        errorContainerE1.textContent='Sorry, the city could not be found. Please check your spelling and try again.';
        errorContainerE1.classList.remove('hidden');
    }
    finally{
        loaderE1.classList.add('hidden');
    }
}

async function fetchWeatherByCoords(lat, lon){
    //url query string
    try{
        errorContainerE1.classList.add('hidden');
        cityName.textContent = '';
        temperature.textContent = '';
        humidity.textContent = '';
        windSpeed.textContent = '';
        forecastContainer.innerHTML = '';

        loaderE1.classList.remove('hidden');
        const currentWeatherUrl=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        
        //metadata of request and metadata
        const responses=await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);
        for(const response of responses){
            if(!response.ok){
                throw new Error("City not found or API error");
            }
        }
        const currentWeather=await responses[0].json();
        const forecast=await responses[1].json();

        displayCurrentWeather(currentWeather);
        displayForecast(forecast.list);
        saveHistory(currentWeather.name);
    }
    catch(error){
        console.error("failed to fetch weather data: ", error);
        errorContainerE1.textContent='Sorry, the city could not be found. Please check your spelling and try again.';
        errorContainerE1.classList.remove('hidden');
    }
    finally{
        loaderE1.classList.add('hidden');
    }
}

searchFormE1.addEventListener('submit', function(event){
    event.preventDefault();
    const city=searchInputE1.value.trim(); //trim to remove whitespace
    if(city){
        fetchWeather(city);
        searchInputE1.value='';
    }
    else{
        console.log("form input is empty");
    }   
})

historyContainerE1.addEventListener('click', function(event){
    if(event.target.matches('.history-btn')){
        const city=event.target.dataset.city;
        fetchWeather(city);
    }
})
renderHistory();

//live location add
if(navigator.geolocation){
    //naviator.geolocation.getCurrentPosition(fun(success), fun(error))
    navigator.geolocation.getCurrentPosition(
        (position)=>{
            const latitude=position.coords.latitude;
            const longitude=position.coords.longitude;
            fetchWeatherByCoords(latitude,longitude);
        },
        (error)=>{
            console.log(error.message);
        }
    )
    console.log("available");
}
else{
    console.log("not available");
}


