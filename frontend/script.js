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

  const navLinks = document.querySelectorAll(".nav-link");
  const homePage = document.getElementById("home-page");
  const favoritesPage = document.getElementById("favorites-page");
  const comparePage = document.getElementById("compare-page");
  const profilePage = document.getElementById("profile-page");
  const contactPage = document.getElementById("contact-page");
  const paymentPage = document.getElementById("payment-page");
  const favoritesList = document.getElementById("favorites-list");
  const favoritesEmpty = document.getElementById("favorites-empty");
  const compareCarsList = document.getElementById("compare-cars-list");
  const comparisonTable = document.getElementById("comparison-table");
  const profileInfo = document.getElementById("profile-info");
  const contactForm = document.getElementById("contact-form");
  const contactSuccess = document.getElementById("contact-success");

  let carsData = [];
  let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
  let token = localStorage.getItem('token');
  let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  let isLoginMode = true;
  let selectedForComparison = new Set();

  updateAuthUI();
  checkAuthentication();
  setupNavigation();

  function setupNavigation() {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        [homePage, favoritesPage, comparePage, profilePage, contactPage, paymentPage].forEach(p => p.classList.add('hidden'));
        
        if (page === 'home') {
          homePage.classList.remove('hidden');
        } else if (page === 'favorites') {
          favoritesPage.classList.remove('hidden');
          loadFavoritesPage();
        } else if (page === 'compare') {
          comparePage.classList.remove('hidden');
          loadComparePage();
        } else if (page === 'profile') {
          profilePage.classList.remove('hidden');
          loadProfilePage();
        } else if (page === 'contact') {
          contactPage.classList.remove('hidden');
        } else if (page === 'payment') {
          paymentPage.classList.remove('hidden');
        }
      });
    });
  }

  function loadFavoritesPage() {
    const favCars = carsData.filter(car => favorites.has(car.id));
    
    if (favCars.length === 0) {
      favoritesList.innerHTML = '';
      favoritesEmpty.classList.remove('hidden');
      return;
    }
    
    favoritesEmpty.classList.add('hidden');
    favoritesList.innerHTML = '';
    
    favCars.forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
        <img src="${car.image}" alt="${car.name}" class="car-img">
        <h3>${car.name}</h3>
        <p>Range: ${car.range} miles</p>
        <p>Price: KSh ${car.price.toLocaleString()}</p>
        <button class="fav-btn" data-id="${car.id}">Remove</button>
      `;
      
      card.querySelector('.fav-btn').addEventListener('click', () => {
        if (token) toggleFavoriteAPI(car.id);
        setTimeout(loadFavoritesPage, 300);
      });
      
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('fav-btn')) showCarDetails(car.id);
      });
      
      favoritesList.appendChild(card);
    });
  }

  function loadComparePage() {
    compareCarsList.innerHTML = '';
    comparisonTable.classList.add('hidden');
    
    carsData.forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
        <img src="${car.image}" alt="${car.name}" class="car-img">
        <h3>${car.name}</h3>
        <p>Range: ${car.range} miles</p>
        <p>Price: KSh ${car.price.toLocaleString()}</p>
        <label class="compare-checkbox">
          <input type="checkbox" ${selectedForComparison.has(car.id) ? 'checked' : ''} data-id="${car.id}">
          Select to Compare
        </label>
      `;
      
      card.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        const carId = parseInt(e.target.dataset.id);
        if (e.target.checked) {
          if (selectedForComparison.size < 3) {
            selectedForComparison.add(carId);
          } else {
            e.target.checked = false;
            alert('You can compare up to 3 cars only');
          }
        } else {
          selectedForComparison.delete(carId);
        }
        updateComparisonButton();
      });
      
      compareCarsList.appendChild(card);
    });
    
    updateComparisonButton();
  }

  function updateComparisonButton() {
    let btn = document.getElementById('compare-action-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'compare-action-btn';
      btn.className = 'compare-btn';
      document.getElementById('compare-selection').appendChild(btn);
    }
    
    if (selectedForComparison.size >= 2) {
      btn.textContent = `Compare ${selectedForComparison.size} Cars`;
      btn.style.display = 'block';
      btn.onclick = showComparison;
    } else {
      btn.style.display = 'none';
    }
  }

  function showComparison() {
    const selectedCars = carsData.filter(car => selectedForComparison.has(car.id));
    
    const fields = ['Image', 'Name', 'Price (KSh)', 'Range (miles)', 'Top Speed (mph)', 'Battery (kWh)', 'Seats'];
    
    let html = '<div class="comparison-grid">';
    
    fields.forEach(field => {
      html += `<div class="comparison-cell header">${field}</div>`;
      selectedCars.forEach(car => {
        let value = '';
        if (field === 'Image') value = `<img src="${car.image}" alt="${car.name}">`;
        else if (field === 'Name') value = car.name;
        else if (field === 'Price (KSh)') value = car.price.toLocaleString();
        else if (field === 'Range (miles)') value = car.range;
        else if (field === 'Top Speed (mph)') value = car.topSpeed || 'N/A';
        else if (field === 'Battery (kWh)') value = car.battery || 'N/A';
        else if (field === 'Seats') value = car.seats || 'N/A';
        
        html += `<div class="comparison-cell">${value}</div>`;
      });
    });
    
    html += '</div>';
    comparisonTable.innerHTML = html;
    comparisonTable.classList.remove('hidden');
  }

  function loadProfilePage() {
    if (!currentUser) return;
    
    profileInfo.innerHTML = `
      <div class="profile-field">
        <label>Username</label>
        <input type="text" value="${currentUser.username}" readonly>
      </div>
      <div class="profile-field">
        <label>Email</label>
        <input type="email" value="${currentUser.email}" readonly>
      </div>
      <div class="profile-field">
        <label>Member Since</label>
        <input type="text" value="${new Date(currentUser.created_at || Date.now()).toLocaleDateString()}" readonly>
      </div>
      <div class="profile-field">
        <label>Total Favorites</label>
        <input type="text" value="${favorites.size}" readonly>
      </div>
    `;
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    contactForm.classList.add('hidden');
    contactSuccess.classList.remove('hidden');
    setTimeout(() => {
      contactForm.reset();
      contactForm.classList.remove('hidden');
      contactSuccess.classList.add('hidden');
    }, 3000);
  });

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
      <p><strong>Acceleration (0-60):</strong> ${car.acceleration || 'N/A'} seconds</p>
      <p><strong>Charging Time:</strong> ${car.chargingTime || 'N/A'}</p>
      <p><strong>Seats:</strong> ${car.seats || 'N/A'}</p>
      <p><strong>Warranty:</strong> ${car.warranty || 'N/A'}</p>
      <p><strong>Description:</strong> ${car.description || 'No description available.'}</p>
      <button class="fav-btn" data-id="${car.id}">
        ${favorites.has(car.id) ? "Favorited" : "Add to Favorites"}
      </button>
      <div class="reviews-section">
        <h3>Reviews & Ratings</h3>
        <div id="reviews-list-${car.id}">Loading reviews...</div>
        ${token ? `
          <div class="add-review">
            <h4>Add Your Review</h4>
            <div class="star-rating">
              <span class="star" data-rating="1">★</span>
              <span class="star" data-rating="2">★</span>
              <span class="star" data-rating="3">★</span>
              <span class="star" data-rating="4">★</span>
              <span class="star" data-rating="5">★</span>
            </div>
            <textarea id="review-comment" placeholder="Write your review..." rows="3"></textarea>
            <button class="submit-review-btn" data-car-id="${car.id}">Submit Review</button>
          </div>
        ` : '<p>Login to add a review</p>'}
      </div>
    `;
    
    modal.classList.remove('hidden');
    loadReviews(car.id);
    setupReviewStars();
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

  let selectedRating = 0;

  function setupReviewStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        stars.forEach((s, i) => {
          s.style.color = i < selectedRating ? '#FFD700' : '#ddd';
        });
      });
    });

    const submitBtn = document.querySelector('.submit-review-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const carId = submitBtn.dataset.carId;
        const comment = document.getElementById('review-comment').value;
        
        if (selectedRating === 0) {
          alert('Please select a rating');
          return;
        }

        try {
          await fetch(`${API_URL}/reviews/${carId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating: selectedRating, comment })
          });
          
          selectedRating = 0;
          document.getElementById('review-comment').value = '';
          loadReviews(carId);
        } catch (err) {
          console.error('Error submitting review:', err);
        }
      });
    }
  }

  async function loadReviews(carId) {
    try {
      const res = await fetch(`${API_URL}/reviews/${carId}`);
      const reviews = await res.json();
      
      const avgRes = await fetch(`${API_URL}/reviews/${carId}/average`);
      const { avgRating, totalReviews } = await avgRes.json();
      
      const reviewsList = document.getElementById(`reviews-list-${carId}`);
      
      if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
      } else {
        let html = `<div class="avg-rating">Average: ${avgRating ? avgRating.toFixed(1) : 'N/A'} ★ (${totalReviews} reviews)</div>`;
        reviews.forEach(review => {
          const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
          html += `
            <div class="review-item">
              <div class="review-header">
                <strong>${review.username}</strong>
                <span class="review-stars">${stars}</span>
              </div>
              <p>${review.comment || 'No comment'}</p>
              <small>${new Date(review.created_at).toLocaleDateString()}</small>
            </div>
          `;
        });
        reviewsList.innerHTML = html;
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  }
});