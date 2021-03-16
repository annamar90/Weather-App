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

  for(let k=0; k<5; ++k) {
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
  let element= document.querySelector("#city");
  element.innerHTML= input.value
  cityQuery(input.value);

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
  
  updateIcon(response, currentWeatherIcon);
  changeDescription(currentWeatherDesc, statusDescription);
}

function updateIcon(response, element) {
  let status=response.data.weather[0].id;
  let statusGroup=parseInt(status.toString()[0]);

  switch(statusGroup) {
    case 2: 
      changeIcon(element, "041-thunderstorm.svg");
      break;

    case 3:
      changeIcon(element, "046-weather.svg");
      break;
    
    case 5:
      switch(status) {
        case 500:
        case 501:
        case 520:
          changeIcon(element, "046-weather.svg");
          break;
        
        case 502:
        case 503:
        case 504:
        case 522:
        case 531:
          changeIcon(element, "027-rain.svg");
          break;
        
        case 521:
          changeIcon(element, "005-rainbow.svg");
          break;
        
        case 511:
          changeIcon(element, "029-raindrop.svg");
          break; 
      }
      break;

    case 6:
      switch(status) {
        case 600:
          changeIcon(element, "032-snowy.svg");
          break;
        
        case 601:
        case 602:
          changeIcon(element, "033-snowy.svg");
          break;
        
        case 611:
        case 612:
        case 613:
          changeIcon(element, "015-hail.svg");
          break;
        
        case 621:
        case 622:
        case 615:
        case 616:
          changeIcon(element, "030-snow.svg");
          break;

      }
      break;

    case 7:
      switch(status) {
        case 781:
          changeIcon(element, "042-tornado.svg");
          break;
        
        default:
          changeIcon(element, "016-haze.svg");
          break;
      }
      break;

    case 8:
      switch(status) {
        case 800:
          changeIcon(element, "036-sun.svg");
          break;

        case 801:
        case 802:
          changeIcon(element, "007-cloudy day.svg");
          break;
        
        case 803:
          changeIcon(element, "006-cloudy.svg");
          break;

        case 804:
          changeIcon(element, "004-clouds.svg");
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
  axios.get(cityUrl).then(cityQueryCompleted);
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

