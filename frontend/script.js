const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://your-backend-url.onrender.com/api';

document.addEventListener("DOMContentLoaded", () => {
  const carList = document.getElementById("car-list");
  const searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");
  const loading = document.getElementById("loading");
  const emptyState = document.getElementById("empty-state");
  const modal = document.getElementById("car-modal");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.querySelectorAll(".modal-close");
  const modalOverlay = document.querySelectorAll(".modal-overlay");
  
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const authButtons = document.getElementById("auth-buttons");
  const userInfo = document.getElementById("user-info");
  const usernameDisplay = document.getElementById("username-display");
  const authModal = document.getElementById("auth-modal");
  const authTitle = document.getElementById("auth-title");
  const authUsername = document.getElementById("auth-username");
  const authEmail = document.getElementById("auth-email");
  const authPassword = document.getElementById("auth-password");
  const authSubmit = document.getElementById("auth-submit");
  const authError = document.getElementById("auth-error");
  const mainContent = document.getElementById("main-content");

  let carsData = [];
  let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
  let token = localStorage.getItem('token');
  let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  let isLoginMode = true;

  updateAuthUI();
  checkAuthentication();

  function checkAuthentication() {
    if (!token || !currentUser) {
      mainContent.style.display = 'none';
      authModal.classList.remove('hidden');
      isLoginMode = true;
      authTitle.textContent = 'Login Required';
      authUsername.style.display = 'none';
      authSubmit.textContent = 'Login';
    } else {
      mainContent.style.display = 'block';
      loadCars();
    }
  }

  function loadCars() {
    fetch(`${API_URL}/cars`)
    .then(res => res.json())
    .then(data => {
      carsData = data;
      loading.classList.add('hidden');
      renderCars(carsData);
      if (token) loadFavoritesFromAPI();
    })
    .catch(err => {
      console.error("Error fetching cars:", err);
      loading.textContent = "Error loading cars. Please refresh.";
    });
  }
  // Search with debouncing
  let searchTimeout;
  searchInput.addEventListener("input", e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value.toLowerCase();
      const filtered = carsData.filter(car =>
        car.name.toLowerCase().includes(query)
      );
      renderCars(filtered);
    }, 300);
  });

  // Sort functionality
  sortSelect.addEventListener("change", e => {
    let sorted = [...carsData];
    if (e.target.value === "price") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (e.target.value === "range") {
      sorted.sort((a, b) => b.range - a.range);
    }
    renderCars(sorted);
  });

  // Handle clicks on car cards and favorite buttons
  carList.addEventListener("click", e => {
    if (e.target.classList.contains("fav-btn")) {
      const carId = parseInt(e.target.dataset.id);
      
      if (token) {
        toggleFavoriteAPI(carId);
      } else {
        if (favorites.has(carId)) {
          favorites.delete(carId);
        } else {
          favorites.add(carId);
        }
        localStorage.setItem('favorites', JSON.stringify([...favorites]));
        renderCars(carsData);
      }
    }
    
    if (e.target.closest('.car-card') && !e.target.classList.contains('fav-btn')) {
      const carId = parseInt(e.target.closest('.car-card').dataset.id);
      showCarDetails(carId);
    }
  });

  // Close modal
  modalClose.forEach(btn => {
    btn.addEventListener("click", () => {
      modal.classList.add('hidden');
      authModal.classList.add('hidden');
    });
  });

  modalOverlay.forEach(overlay => {
    overlay.addEventListener("click", () => {
      modal.classList.add('hidden');
      authModal.classList.add('hidden');
    });
  });

  loginBtn.addEventListener("click", () => {
    isLoginMode = true;
    authTitle.textContent = "Login";
    authUsername.style.display = "none";
    authSubmit.textContent = "Login";
    authError.classList.add('hidden');
    authModal.classList.remove('hidden');
  });

  registerBtn.addEventListener("click", () => {
    isLoginMode = false;
    authTitle.textContent = "Register";
    authUsername.style.display = "block";
    authSubmit.textContent = "Register";
    authError.classList.add('hidden');
    authModal.classList.remove('hidden');
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    currentUser = null;
    favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
    updateAuthUI();
    renderCars(carsData);
  });

  authSubmit.addEventListener("click", async () => {
    const email = authEmail.value;
    const password = authPassword.value;
    const username = authUsername.value;

    if (!email || !password || (!isLoginMode && !username)) {
      authError.textContent = "All fields are required";
      authError.classList.remove('hidden');
      return;
    }

    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const body = isLoginMode ? { email, password } : { username, email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        authError.textContent = data.error || 'Authentication failed';
        authError.classList.remove('hidden');
        return;
      }

      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      authModal.classList.add('hidden');
      authEmail.value = '';
      authPassword.value = '';
      authUsername.value = '';
      
      updateAuthUI();
      mainContent.style.display = 'block';
      loadCars();
      loadFavoritesFromAPI();
    } catch (err) {
      authError.textContent = 'Network error. Please try again.';
      authError.classList.remove('hidden');
    }
  });

  function renderCars(cars) {
    carList.innerHTML = "";
    
    if (cars.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }
    
    emptyState.classList.add('hidden');
    
    cars.forEach(car => {
      const card = document.createElement("div");
      card.className = "car-card";
      card.dataset.id = car.id;
      
      card.innerHTML = `
        <img src="${car.image}" alt="${car.name}" class="car-img">
        <h3>${car.name}</h3>
        <p>Range: ${car.range} miles</p>
        <p>Price: KSh ${car.price.toLocaleString()}</p>
        <button class="fav-btn" data-id="${car.id}">
          ${favorites.has(car.id) ? "Favorited" : "Add to Favorites"}
        </button>
      `;
      
      carList.appendChild(card);
    });
  }

  function showCarDetails(carId) {
    const car = carsData.find(c => c.id === carId);
    if (!car) return;
    
    modalBody.innerHTML = `
      <h2>${car.name}</h2>
      <img src="${car.image}" alt="${car.name}">
      <p><strong>Range:</strong> ${car.range} miles</p>
      <p><strong>Price:</strong> KSh ${car.price.toLocaleString()}</p>
      <p><strong>Top Speed:</strong> ${car.topSpeed || 'N/A'} mph</p>
      <p><strong>Battery:</strong> ${car.battery || 'N/A'} kWh</p>
      <p><strong>Seats:</strong> ${car.seats || 'N/A'}</p>
      <p><strong>Description:</strong> ${car.description || 'No description available.'}</p>
      <button class="fav-btn" data-id="${car.id}">
        ${favorites.has(car.id) ? "Favorited" : "Add to Favorites"}
      </button>
    `;
    
    modal.classList.remove('hidden');
  }

  async function loadFavoritesFromAPI() {
    try {
      const res = await fetch(`${API_URL}/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const favs = await res.json();
      favorites = new Set(favs.map(car => car.id));
      renderCars(carsData);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }

  async function toggleFavoriteAPI(carId) {
    try {
      if (favorites.has(carId)) {
        await fetch(`${API_URL}/favorites/${carId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        favorites.delete(carId);
      } else {
        await fetch(`${API_URL}/favorites/${carId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        favorites.add(carId);
      }
      renderCars(carsData);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }

  function updateAuthUI() {
    if (currentUser) {
      authButtons.classList.add('hidden');
      userInfo.classList.remove('hidden');
      usernameDisplay.textContent = `Welcome, ${currentUser.username}!`;
    } else {
      authButtons.classList.remove('hidden');
      userInfo.classList.add('hidden');
    }
  }
});