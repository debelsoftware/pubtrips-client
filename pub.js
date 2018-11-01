let globalData;
let pubTime;
let host = "http://localhost:8080" //"https://debelapi.website:8443"

function checkLogin(){
  if (sessionStorage.getItem("authToken") != null){
    document.getElementById("info-box").style.display = "block";
    document.getElementById("login-box").style.display = "none";
    document.getElementById("user-controls").style.display = "block";
    getGlobalData();
  }
}

function validate(data){
  if (data == "" || data == null || data.length > 30){
    return false;
  }
  else {
    return true;
  }
}

function onSignIn(googleUser) {
  let profile = googleUser.getBasicProfile();
  let id_token = googleUser.getAuthResponse().id_token;
  console.log(id_token);
  sessionStorage.setItem("authToken",id_token);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", host+'/auth', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
    if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      if (JSON.parse(xhr.responseText)["data"] == "auth"){
      document.getElementById("info-box").style.display = "block";
      document.getElementById("login-box").style.display = "none";
      document.getElementById("user-controls").style.display = "block";
      getGlobalData();
      }
      else {
        document.location.href = "./firsttimesetup.html";
      }
    }
  }
  xhr.send(JSON.stringify({ "token": id_token}));
}

function signOut() {
  let auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    sessionStorage.setItem("authToken","null");
    document.location.href = "..";
  });
}

function onLoad() {
  gapi.load('auth2', function() {
    gapi.auth2.init();
  });
}
function signOut2() {

}

function getPersonalDates(){
  let d = new Date();
  let t = d.getTime();
  let xhr = new XMLHttpRequest();
  xhr.open("POST", host+'/users', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
    if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      globalData = xhr.responseText;
      let data = JSON.parse(globalData);
      for (i=0; i < data["data"].length; i++){
        if (data["data"][i]["lastTime"] == pubTime["data"]){
          document.getElementById("append-users").innerHTML += '<li class="user rainbow" onclick="showModel('+i+')"><div class="left"><img src="'+data["data"][i]["profilePic"]+'" class="profile" alt=""><p>'+data["data"][i]["username"]+'</p></div><div class="right"><p id="usertime'+i+'">loading...</p><img src="../img/beer.svg" class="icon" alt=""></div></li>'
        }
        else {
          document.getElementById("append-users").innerHTML += '<li class="user" onclick="showModel('+i+')"><div class="left"><img src="'+data["data"][i]["profilePic"]+'" class="profile" alt=""><p>'+data["data"][i]["username"]+'</p></div><div class="right"><p id="usertime'+i+'">loading...</p><img src="../img/beer.svg" class="icon" alt=""></div></li>'
        }
        let difference = t - data["data"][i]["lastTime"];
        plural(difference,i)
      }
    }
  }
  xhr.send(JSON.stringify({ "token": sessionStorage.getItem("authToken") }));
}

function plural(difference,i){
  let minutes = 1000 * 60;
  let hours = minutes * 60;
  let days = hours * 24;
  if (Math.round(difference / days) < 1){
    document.getElementById("usertime" + i).innerHTML = "less than 24 hours ago";
  }
  else if (Math.round(difference / days) > 10000) {
    document.getElementById("usertime" + i).innerHTML = "Missing Record";
  }
  else{
    let diffInDays = Math.round(difference / days);
    let diffInWeeks = Math.floor(diffInDays/7);
    if (diffInWeeks == 0){
      if (diffInDays == 1){
        document.getElementById("usertime" + i).innerHTML = "1 day ago";
      }
      else{
        document.getElementById("usertime" + i).innerHTML = diffInDays + " days ago";
      }
    }
    else if (diffInDays % 7 == 0) {
      if (diffInWeeks == 1){
        document.getElementById("usertime" + i).innerHTML = "1 week ago";
      }
      else {
        document.getElementById("usertime" + i).innerHTML = diffInWeeks + " weeks ago";
      }
    }
    else{
      document.getElementById("usertime" + i).innerHTML = diffInWeeks + " weeks and " + (diffInDays%7)+" days ago";
    }
  }
}

function getGlobalData(){
  let d = new Date();
  let t = d.getTime();
  let xhr = new XMLHttpRequest();
  xhr.open("POST", host+'/lastpub', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        console.log(xhr.responseText);
        pubTime = JSON.parse(xhr.responseText);
        let difference = t - pubTime["data"];
        plural(difference,"Global");
        getPersonalDates();
      }
  }
  xhr.send(JSON.stringify({ "token": sessionStorage.getItem("authToken") }));
}

function updateDrink(){
  let drink = document.getElementById("drink-input").value;
  if (validate(drink)){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", host+'/drink', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
          document.getElementById("user-entry").style.display = "none";
          document.getElementById("confirm-box").style.display = "block";
        }
        else{
          document.getElementById("warning-text").innerHTML = "Sorry. Our server didn't like that request. Please re-login and try again later";
        }
    }
    xhr.send(JSON.stringify({ "token": sessionStorage.getItem("authToken"), "drink": drink }));
  }
  else {
    document.getElementById("warning-text").innerHTML = "Data not valid. Ensure text is less than 30 characters"
  }
}

function updateUsername(){
  let newUsername = document.getElementById("newusername-input").value;
  if (validate(newUsername)){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", host+'/updateUsername', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        document.getElementById("user-entry").style.display = "none";
        document.getElementById("confirm-box").style.display = "block";
      }
      else{
        document.getElementById("warning-text").innerHTML = "Sorry. Our server didn't like that request. Please re-login and try again later";
      }
    }
    xhr.send(JSON.stringify({ "token": sessionStorage.getItem("authToken"), "newUsername": newUsername }));
  }
  else {
    document.getElementById("warning-text").innerHTML = "Data not valid. Ensure text is less than 30 characters"
  }
}

function updateDistance(){
  let newDistance = document.getElementById("newdistance-input").value;
  if (newDistance >= 1000 || newDistance == "" || newDistance <0 || newDistance === null){
    document.getElementById("warning-text").innerHTML = "Data not valid. Ensure distance is between 0 and 1000";
  }
  else {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", host+'/updateDistance', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
      if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        document.getElementById("user-entry").style.display = "none";
        document.getElementById("confirm-box").style.display = "block";
      }
      else{
        document.getElementById("warning-text").innerHTML = "Sorry. Our server didn't like that request. Please re-login and try again later";
      }

    }
    xhr.send(JSON.stringify({ "token": sessionStorage.getItem("authToken"), "newDistance": newDistance }));
  }
}

function showModel(user){
  document.getElementById("model").style.visibility = "visible"
  document.getElementById("model").style.top = "0";
  let data = JSON.parse(globalData);
  document.getElementById("model-name").innerHTML = data["data"][user]["username"]
  document.getElementById("model-pic").src = data["data"][user]["profilePic"]
  document.getElementById("model-drink").innerHTML = data["data"][user]["drink"]
  document.getElementById("model-distance").innerHTML = data["data"][user]["distance"]+" Miles"
}

function closeModel(){
  document.getElementById("model").style.top = "-200%";
  document.getElementById("model").style.visibility = "hidden"
}
