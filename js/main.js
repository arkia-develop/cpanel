// Core API communication function that handles all HTTP requests
function sendApi(url, data, method = 'GET') {
  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: method !== 'GET' ? JSON.stringify(data) : undefined
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

// Utility function to decode JWT tokens
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

// Function to load HTML content dynamically
function loadPage(href) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", href, false);
  xmlhttp.send();
  if (xmlhttp.status === 200) {
    return xmlhttp.responseText;
  } else {
    throw new Error(xmlhttp.statusText);
  }
}

// Authentication check function
function checkAuth() {
  const user = localStorage.getItem('user');
  if (!user) {
    return false;
  }

  try {
    const userData = JSON.parse(user);
    // Check if user data is valid
    if (!userData || !userData.id) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}

// Logout function
function logout() {
  // Clear user data
  localStorage.removeItem('user');
  
  // Redirect to login page
  window.location.href = 'sign-in.html';
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!checkAuth()) {
    window.location.href = 'sign-in.html';
    return;
  }

  // Load user data
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.name) {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }
  }
});