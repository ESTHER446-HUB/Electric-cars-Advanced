document.addEventListener("DOMContentLoaded", () => {
  const carList = document.getElementById("car-list");
  const searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");
  const loading = document.getElementById("loading");
  const emptyState = document.getElementById("empty-state");
  const modal = document.getElementById("car-modal");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.querySelector(".modal-close");
  const modalOverlay = document.querySelector(".modal-overlay");

  let carsData = [];
  let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));

  fetch("./cars.json")
    .then(res => res.json())
    .then(data => {
      carsData = data;
      loading.classList.add('hidden');
      renderCars(carsData);
    })
    .catch(err => {
      console.error("Error fetching cars:", err);
      loading.textContent = "Error loading cars. Please refresh.";
    });
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
      if (favorites.has(carId)) {
        favorites.delete(carId);
      } else {
        favorites.add(carId);
      }
      localStorage.setItem('favorites', JSON.stringify([...favorites]));
      renderCars(carsData);
    }
    
    if (e.target.closest('.car-card') && !e.target.classList.contains('fav-btn')) {
      const carId = parseInt(e.target.closest('.car-card').dataset.id);
      showCarDetails(carId);
    }
  });

  // Close modal
  modalClose.addEventListener("click", () => {
    modal.classList.add('hidden');
  });

  modalOverlay.addEventListener("click", () => {
    modal.classList.add('hidden');
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
});