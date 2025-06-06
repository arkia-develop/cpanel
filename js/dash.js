// User class to handle user authentication and profile data
class User {
  claim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/";
  token;
  id;
  name;
  email;
  exp;
  
  constructor(token) {
    this.token = token;
    this.id = parseJwt(token)[this.claim + "id"];
    this.name = parseJwt(token)[this.claim + "name"];
    this.email = parseJwt(token)[this.claim + "emailaddress"];
    this.exp = parseJwt(token)["exp"];
  }
}

// Global user variable to store current user data
var user;

// Supported languages and data storage arrays
var languages = ["it", "en", "ar"],
    allOffers = [], 
    alldests = [];

// Offer class to structure offer data
class Offer {
  name;
  day_night;
  description;
  image;
  languageCode;
}

// Destination class to structure destination data
class Dest {
  name;
  places = [];
  description;
  image;
  languageCode;
}

// Function to handle image uploads
function addImage(url, img) {
  var inputFile = img;
  var data = new FormData();
  data.append("imgName", inputFile.files[0].name);
  data.append("img", inputFile.files[0]);
  
  fetch(url, {
    method: "PUT",
    body: data,
    headers: {
      "Accept": "*/*",
    },
  })
    .then((response) => response.text())
    .then((txt) => {
      // Handle the response from the server
      console.log(txt);
    });
}

// Function to make GET API requests
function reqApi(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET", url, true);
    
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(this.statusText);
      }
    };
    
    xhr.send();
  });
}

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

// if ( Number(token) != NaN ) {
//     // updatePass(Number(result.data));
//     alert("you didn't confirm your identity yet please return and change your password");
//     window.location.href = "./sign-in.html"
// }

function sendApi(url, data, method) {
  console.log(url);
  console.log(data);
  console.log(method);
  // Create a new promise
  return new Promise(function (resolve, reject) {
    // Create a new XHR object
    var xhr = new XMLHttpRequest();
    // Set the response type to JSON
    xhr.responseType = "json";

    // Open the request with the given url
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    // Define what to do when the request is loaded
    xhr.onload = function () {
      // Check if the status is 200 (OK)
      if (this.status === 200) {
        // Resolve the promise with the response object
        resolve(this.response);
      } else {
        // Reject the promise with the status text
        reject(this.statusText);
      }
    };
    // Send the request
    xhr.send(data);
  });
}

function loadPage(href)
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}