// EV Explorer - Main JavaScript File
// This handles all the interactive features of the electric car explorer

document.addEventListener("DOMContentLoaded", () => {
  // Get references to important HTML elements we'll be working with
  const carList = document.getElementById("car-list");
  const searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");
  const loading = document.getElementById("loading");
  const emptyState = document.getElementById("empty-state");

  // Store all car data here once we fetch it
  let carsData = [];
  
  // Keep track of which cars the user has favorited
  // We load any previously saved favorites from localStorage
  let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));

  // Fetch car data from our local JSON file
  fetch("./cars.json")
    .then(res => res.json())
    .then(data => {
      // Store the data and display the cars
      carsData = data;
      loading.classList.add('hidden'); // Hide the loading spinner
      renderCars(carsData);
    })
    .catch(err => {
      // If something goes wrong, show an error message
      console.error("Error fetching cars:", err);
      loading.textContent = "Error loading cars. Please refresh.";
    });
https://dashboard.render.com/web/srv-d3bekiali9vc738jnk00/deploys/dep-d3bekiqli9vc738jnk90
  // ===== Event Listeners =====
  
  // 1. Search filter - runs every time user types in the search box
  searchInput.addEventListener("input", e => {
    const query = e.target.value.toLowerCase();
    // Filter cars to only show ones that match the search query
    const filtered = carsData.filter(car =>
      car.name.toLowerCase().includes(query)
    );
    renderCars(filtered);
  });

  // 2. Sort dropdown - runs when user selects a sorting option
  sortSelect.addEventListener("change", e => {
    let sorted = [...carsData]; // Make a copy so we don't mess up the original
    
    if (e.target.value === "price") {
      // Sort from cheapest to most expensive
      sorted.sort((a, b) => a.price - b.price);
    } else if (e.target.value === "range") {
      // Sort from longest range to shortest
      sorted.sort((a, b) => b.range - a.range);
    }
    renderCars(sorted);
  });

  // 3. Favorite button - we use event delegation here
  // Instead of adding a listener to each button, we listen on the parent container
  carList.addEventListener("click", e => {
    if (e.target.classList.contains("fav-btn")) {
      const carId = parseInt(e.target.dataset.id);
      
      // Toggle favorite status - if it's already favorited, remove it, otherwise add it
      if (favorites.has(carId)) {
        favorites.delete(carId);
      } else {
        favorites.add(carId);
      }
      
      // Save the updated favorites to localStorage so they persist after page refresh
      localStorage.setItem('favorites', JSON.stringify([...favorites]));
      renderCars(carsData);
    }
  });

  // ===== Helper Functions =====
  
  // This function takes an array of cars and displays them on the page
  function renderCars(cars) {
    carList.innerHTML = ""; // Clear out any existing cards first
    
    // Check if there are no cars to display
    if (cars.length === 0) {
      emptyState.classList.remove('hidden'); // Show the "no results" message
      return; // Exit early since there's nothing to render
    }
    
    // If we have cars, make sure the empty state is hidden
    emptyState.classList.add('hidden');
    
    // Loop through each car and create a card for it
    cars.forEach(car => {
      const card = document.createElement("div");
      card.className = "car-card";
      
      // Build the HTML for this car card
      card.innerHTML = `
        <img src="${car.image}" alt="${car.name}" class="car-img">
        <h3>${car.name}</h3>
        <p>Range: ${car.range} miles</p>
        <p>Price: $${car.price.toLocaleString()}</p>
        <button class="fav-btn" data-id="${car.id}">
          ${favorites.has(car.id) ? "Favorited" : "Add to Favorites"}
        </button>
      `;
      
      // Add this card to the page
      carList.appendChild(card);
    });
  }
});