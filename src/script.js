function currentTime() {
  let now= new Date();
  let minutesStr= now.getMinutes().toString();

  if (minutesStr.length <2) {
    minutesStr= "0" + minutesStr;
  }

  return now.getHours() + ":" + minutesStr;
}

function currentDate() {
  let months= ["Jan", "Feb", "March", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let days= ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  let now= new Date();
  let monthStr= months[now.getMonth()];
  let dayStr= days[now.getDay()];
  let day= now.getDate();
  let year= now.getFullYear();
  let daySuff;
  
  switch(day)
  {
    case 1:
    case 21:
    case 31:
      daySuff="st";
      break;

    case 2:
    case 22:
      daySuff="nd";
      break;

    case 3:
    case 23:
      daySuff="rd";
      break;

    default:
      daySuff="th";
      break;
  }

  return dayStr + ", " + day + daySuff + " " + monthStr + " " + year;
}


function setTime() {
  let element=document.querySelector("#time");

  if(element===null) {
    return;
  }

  element.innerHTML= currentTime();
}

function setDate() {
  let element=document.querySelector("#date");
  
  if(element===null) {
    return;
  }

  element.innerHTML= currentDate();
}

function setDaysNames() {
  const names=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayNumber=new Date().getDay();

  let daysElements=[];

  for(let k=0; k<4; ++k) {
    daysElements.push(document.querySelector("#day"+k));
  }

  daysElements.forEach((element, dayNumber)=>{
    element.innerHTML=names[(todayNumber+dayNumber+1)%7];
  });
}

function setAll() {
  setTime();
  setDate();
  setDaysNames();
  getCurrentPosition();
}

function searchCity (event) {
  event.preventDefault();
  let input= document.querySelector("input");
  let inputValue=input.value;
  input.value="";
  cityQuery(inputValue);

}

function addFormEvent() {
  let form= document.querySelector ("form");

  if(form===null) {
    return;
  }

  form.addEventListener("submit", searchCity);
}

var units="C";

function changeDegrees() {
  let currentElement=document.querySelector("#current-temp");
  let minmaxElement=document.querySelector("#minmax-temp");

  if(currentElement===null || minmaxElement===null) {
    return;
  }

  let currentText=currentElement.innerHTML;
  let maxText=minmaxElement.innerHTML.split("/")[0];
  let minText=minmaxElement.innerHTML.split("/")[1];
  
  let prevMode;
  let newMode;
  let currentTemp;
  let minTemp;
  let maxTemp;

  if(currentText.includes("C"))
  {
    prevMode="C";
    newMode="F";
  }
  else
  {
    prevMode="F";
    newMode="C";
  }

  units=newMode;

  currentTemp=currentText.replace(" °"+prevMode, "");
  maxTemp=maxText.replace(" °"+prevMode, "");
  minTemp=minText.replace(" °"+prevMode, "");

  if(prevMode==="C") {
    currentTemp=(currentTemp * (9/5)) + 32;
    maxTemp=(maxTemp * (9/5)) + 32;
    minTemp=(minTemp * (9/5)) + 32;
  }
  else {
    currentTemp=(currentTemp - 32) * (5/9);
    maxTemp=(maxTemp - 32) * (5/9);
    minTemp=(minTemp - 32) * (5/9);
  }

  currentText = Math.round(currentTemp).toString() + " °" + newMode;
  maxText= Math.round(maxTemp).toString() + " °" + newMode;
  minText= Math.round(minTemp).toString() + " °" + newMode;

  currentElement.innerHTML=currentText;
  minmaxElement.innerHTML=maxText + "/" + minText;

  for(let k=0; k<4; ++k)
  {
    let el=document.querySelector("#tempDay"+k);

    maxText=el.innerHTML.split("/")[0];
    minText=el.innerHTML.split("/")[1];

    maxTemp=maxText.replace(" °"+prevMode, "");
    minTemp=minText.replace(" °"+prevMode, "");

    if(prevMode==="C") {
      maxTemp=(maxTemp * (9/5)) + 32;
      minTemp=(minTemp * (9/5)) + 32;
    }
    else {
      maxTemp=(maxTemp - 32) * (5/9);
      minTemp=(minTemp - 32) * (5/9);
    }

    maxText= Math.round(maxTemp).toString() + " °" + newMode;
    minText= Math.round(minTemp).toString() + " °" + newMode;

    el.innerHTML=maxText + "/" + minText;
  }
}

function updateWeekTemp(element, info) {
  maxText= Math.round(info.temp_max).toString() + " °" + units;
  minText= Math.round(info.temp_min).toString() + " °" + units;

  element.innerHTML=maxText+" / "+minText;
}

function addThermometerEvent() {
  let element= document.querySelector ("#thermometer");

  if(element===null) {
    return;
  }

  element.addEventListener("click", changeDegrees);
}

addCurrentLocationEvent();
addThermometerEvent();
addFormEvent();
setAll();


function cityQueryCompleted(response) {
  
  updateCityName(response);
  updateCurrentTime(response);
  updateTemps(response);
  updateWeatherStatus(response);
  updateHumidity(response);
  updateWindSpeed(response);
  updateSunriseTime(response);
  updateSunsetTime(response);

  retrieveWeekForecast(response.data.name);
}

function retrieveWeekForecastCompleted(response) {
  if(response.data.cnt<40)
  {
    return
  }

  let forecasts=[
    response.data.list[8],
    response.data.list[16],
    response.data.list[24],
    response.data.list[32]
  ]

  let minTemps=new Array(forecasts.length).fill(Number.MAX_VALUE);
  let maxTemps=new Array(forecasts.length).fill(Number.MIN_VALUE);
  let days=[];

  for(let k=0, kMax=response.data.cnt; k<kMax; ++k)
  {
    const item=response.data.list[k];
    const dt_txt=item.dt_txt;
    const data=dt_txt.split(" ")[0];

    if(days.includes(data)===false)
    {
      days.push(data);
    }

    if(days.length<2)
    {
      continue;
    }

    const currentDay=days.length-2;
    const dayMin=parseFloat(item.main.temp_min);
    const dayMax=parseFloat(item.main.temp_max);

    if(dayMin<minTemps[currentDay])
    {
      minTemps[currentDay]=dayMin;
    }

    if(dayMax>maxTemps[currentDay])
    {
      maxTemps[currentDay]=dayMax;
    }
  }

  forecasts.forEach((forecast, number)=>{
    let element=document.querySelector("#day"+number+"WeatherIcon");
    let element1=document.querySelector("#descriptionDay"+number);
    let element2=document.querySelector("#tempDay"+number);

    updateIcon(forecast.weather, element, false);
    changeDescription(element1, forecast.weather[0].description);

    const info=
    {
      temp_min: minTemps[number],
      temp_max: maxTemps[number],
    };

    updateWeekTemp(element2, info);
  })
}

function updateBackgroundImage(imageName) {
  let element= document.querySelector("#container");
  let path= "images/"+imageName;

  element.style.backgroundImage="url('"+ path +"')";
}

function updateCityName(response) {
  let element= document.querySelector("#city");
  element.innerHTML= response.data.name + " ("+ response.data.sys.country + ")";
}

function updateCurrentTime(response) {
  let element=document.querySelector("#time");

  if(element===null) {
    return;
  }

  let time=new Date();
  time=time.getTime()/1000;

  element.innerHTML= timestampToStr(time, response.data.timezone);
}

function updateTemps(response) {
  let currentText= Math.round(response.data.main.temp).toString() + " °" + units;
  let minText= Math.round(response.data.main.temp_min).toString() + " °" + units;
  let maxText= Math.round(response.data.main.temp_max).toString() + " °" + units;

  let currentElement=document.querySelector("#current-temp");
  let minmaxElement=document.querySelector("#minmax-temp");
  
  currentElement.innerHTML=currentText;
  minmaxElement.innerHTML=maxText + "/" + minText;
}

function updateWeatherStatus(response) {
  let currentWeatherIcon=document.querySelector("#currentWeatherIcon");
  let currentWeatherDesc=document.querySelector("#currentWeatherDesc"); 

  let statusDescription=response.data.weather[0].description;
  
  updateIcon(response.data.weather, currentWeatherIcon, true);
  changeDescription(currentWeatherDesc, statusDescription);
}

function updateTips(text, icon, link) {
  let element= document.querySelector("#adviceLink");
  let iconElement= document.querySelector("#adviceIcon");
  element.setAttribute("href", link);
  element.innerHTML=text;
  iconElement.textContent=icon;
}

function updateIcon(weather, element, isCurrent) {
  let status=weather[0].id;
  let statusGroup=parseInt(status.toString()[0]);

  switch(statusGroup) {
    case 2: 
      changeIcon(element, "041-thunderstorm.svg");

      if(isCurrent) {
        updateBackgroundImage("Thunderstorm.jpg");
        updateTips("Click me and check out some useful Lightning Safety tips!",
                        "⚡👍",
                        "https://www.nationalgeographic.com/environment/article/lightning-safety-tips");
        
      }
      break;

    case 3:
      changeIcon(element, "046-weather.svg");
       if(isCurrent) {
        updateBackgroundImage("Spiderweb2.jpg");
        updateTips("Click me and discover the beauty of Rain in art!",
                        "🌂🎨",
                        "https://artgallery.co.uk/blog/post/2017/01/06/capturing-the-beauty-of-the-rain-in-art");
      }
      break;
    
    case 5:
      switch(status) {
        case 500:
        case 501:
        case 520:
          changeIcon(element, "046-weather.svg");
          if(isCurrent) {
            updateBackgroundImage("Spiderweb2.jpg");
            updateTips("Click me and discover the beauty of Rain in art!",
                        "🌂🎨",
                        "https://artgallery.co.uk/blog/post/2017/01/06/capturing-the-beauty-of-the-rain-in-art");
          }
          break;
        
        case 502:
        case 503:
        case 504:
        case 522:
        case 531:
          changeIcon(element, "027-rain.svg");
          if(isCurrent) {
        updateBackgroundImage("Rain.jpg");
         updateTips("Click me and remember to drive safely in the rain!",
                        "🚙☔",
                        "https://driving-tests.org/beginner-drivers/how-to-drive-in-rain/");
          }
          break;
        
        case 521:
          changeIcon(element, "005-rainbow.svg");
          if(isCurrent) {
        updateBackgroundImage("Rainbow.jpg");
         updateTips("Click me and discover 17 awesome facts about Rainbows!",
                        "🌈💡",
                        "https://www.treehugger.com/curious-things-know-about-rainbows-4858620");
          }
          break;
        
        case 511:
          changeIcon(element, "029-raindrop.svg");
          if(isCurrent) {
        updateBackgroundImage("Raindrop.jpg");
           updateTips("Click me and find out how freezing rain forms!",
                        "💧❓",
                        "https://earthsky.org/earth/all-about-freezing-rain");
          }
          break; 
      }
      break;

    case 6:
      switch(status) {
        case 600:
          changeIcon(element, "032-snowy.svg");
          if(isCurrent) {
        updateBackgroundImage("Snowy Mountains.jpg");
          }
          break;
        
        case 601:
        case 602:
          changeIcon(element, "033-snowy.svg");
          if(isCurrent) {
        updateBackgroundImage("Snowy woods.jpeg");
          }
          break;
        
        case 611:
        case 612:
        case 613:
          changeIcon(element, "015-hail.svg");
          if(isCurrent) {
        updateBackgroundImage("Hail.jpg");
          }
          break;
        
        case 621:
        case 622:
        case 615:
        case 616:
          changeIcon(element, "030-snow.svg");
          if(isCurrent) {
        updateBackgroundImage("Snow top.jpg");
          }
          break;

      }
      break;

    case 7:
      switch(status) {
        case 781:
          changeIcon(element, "042-tornado.svg");
          if(isCurrent) {
            updateBackgroundImage("Tornado.jpg");
            updateTips("Click me and learn ways you can protect your family and home!",
                        "🌀🏠",
                        "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/tornado.html");
          }
          break;
        
        default:
          changeIcon(element, "016-haze.svg");
          if(isCurrent) {
            updateBackgroundImage("Misty woods.jpg");
            updateTips("Click me and remember to ride safely!",
                        "🚲👀",
                        "https://www.bicycling.com/bikes-gear/g20017365/the-science-of-being-seen-a-guide-to-safer-riding/");
          }
          break;
      }
      break;

    case 8:
      switch(status) {
        case 800:
          changeIcon(element, "036-sun.svg");
          if(isCurrent) {
        updateBackgroundImage("sunny poppies.jpg");
         updateTips("Click me and safely enjoy your day in the Sun!",
                        "🌞🔺",
                        "https://careinthesun.org/sun-protection/ways-to-enjoy-the-sun-safely/");
          }
          break;

        case 801:
        case 802:
          changeIcon(element, "007-cloudy day.svg");
          if(isCurrent) {
            updateBackgroundImage("Scattered Clouds.jpg");
                updateTips("Click me and learn how to recognize clouds!",
                        "⛅🔎",
                        "https://www.thoughtco.com/types-of-clouds-recognize-in-the-sky-4025569");
          }
          break;
        
        case 803:
          changeIcon(element, "006-cloudy.svg");
          if(isCurrent) {
            updateBackgroundImage("Cloudy valley.jpg");
              updateTips("Click me and get inspired by these quotes!",
                        "⛅📚",
                        "https://resilientblog.co/inspirational/quotes-about-clouds/");
          }
          break;

        case 804:
          changeIcon(element, "004-clouds.svg");
          if(isCurrent) {
            updateBackgroundImage("Broken Clouds.jpg");
              updateTips("Click me and get your playlist for cloudy days!",
                        "⛅🎶",
                        "https://www.theodysseyonline.com/an-ode-to-overcast");
          }
          break;
      }
      break;
    
    default:
      break;
  }
}

function changeIcon(element, icon) {
  if(element===null) {
    return;
  }

  element.setAttribute("src", "icons/"+icon);
}

function changeDescription(element, description) {
  if(element===null) {
    return;
  }

  element.innerHTML=description;
}

function updateHumidity(response) {
  let currentElement=document.querySelector("#currentHumidity");
  currentElement.innerHTML=response.data.main.humidity + "%";
}

function updateWindSpeed(response) {
  let currentElement=document.querySelector("#currentWindSpeed");
  currentElement.innerHTML=response.data.wind.speed + "km/h";
}

function updateSunriseTime(response) {
  let currentElement=document.querySelector("#currentSunriseTime");
  currentElement.innerHTML=timestampToStr(response.data.sys.sunrise, response.data.timezone);
}

function updateSunsetTime(response) {
  let currentElement=document.querySelector("#currentSunsetTime");
  currentElement.innerHTML=timestampToStr(response.data.sys.sunset, response.data.timezone);
}

function timestampToStr(timestamp, timezone) {
  let time=new Date((timestamp+timezone)*1000);
  let minutes=time.getUTCMinutes().toString();

  if(minutes.length<2) {
    minutes="0"+minutes;
  }

  return time.getUTCHours()+":"+minutes;
}

function getUnitsType() {
  switch(units)
  {
    case "F":
      return "imperial";

    default:
      return "metric";
  }
}

function cityQuery(cityName) {
  let apiUrl= "https://api.openweathermap.org/data/2.5/weather?";
  let apiKey= "f8ea34379b91acbd2b4566022d7f64a7";
  let apiUnits=getUnitsType();

  let cityUrl= apiUrl + "q=" + cityName + "&units=" + apiUnits + "&appid=" + apiKey;
  axios.get(cityUrl).then(cityQueryCompleted).catch(()=>alert("Sorry, city not found 😕 Please, check and retry."));
}

function retrieveWeekForecast(cityName) {
  let apiUrl= "https://api.openweathermap.org/data/2.5/forecast?";
  let apiKey= "f8ea34379b91acbd2b4566022d7f64a7";
  let apiUnits=getUnitsType();

  let cityUrl= apiUrl + "q=" + cityName + "&units=" + apiUnits + "&appid=" + apiKey;
  axios.get(cityUrl).then(retrieveWeekForecastCompleted);
}

function addCurrentLocationEvent() {
  let button= document.querySelector ("#buttonloc");

  if(button===null) {
    return
  }

  button.addEventListener("click", getCurrentPosition);
}

function getCurrentPosition() {
  navigator.geolocation.getCurrentPosition(currentCoords);
}

function currentCoords(pos) {
  let lat= pos.coords.latitude;
  let lon= pos.coords.longitude;

  let apiUnits=getUnitsType();

  let apiKey= "f8ea34379b91acbd2b4566022d7f64a7";
  let apiUrl= "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=" + apiUnits + "&appid=" + apiKey;

  axios.get(apiUrl).then(cityQueryCompleted);
}

