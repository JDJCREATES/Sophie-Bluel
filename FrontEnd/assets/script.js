const API_URL = "http://localhost:5678/api";

//this function retrieves all projects
async function fetchWorks() {
  try {
    const response = await fetch(`${API_URL}/works`);
    const works = await response.json();
    return works;
  } catch (error) {
    console.error("Error fetching works:", error);
    return [];
  }
}

function displayWorks(works) {
  // find the gallery section Document Object
  const gallery = document.querySelector(".gallery");
  //clear it
  gallery.innerHTML = "";

  //map each work to a Figure element
  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;

    gallery.appendChild(figure);
  });
}

//dynamically add filter buttons + helper methods
async function fetchCategories() {
  try {
    // await the response using a template literal plus API variable
    const response = await fetch(`${API_URL}/categories`);
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

function createFilterButtons(categories, works) {
  const portfolioSection = document.getElementById("portfolio");
  const title = portfolioSection.querySelector("h2");

  const filterContainer = document.createElement("div");
  filterContainer.className = "filters";

  const allButton = document.createElement("button");
  allButton.textContent = "All";
  allButton.className = "filter-btn active";
  allButton.addEventListener("click", () => {
    displayWorks(works);
    setActiveFilter(allButton);
  });

  filterContainer.appendChild(allButton);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.className = "filter-btn";
    button.addEventListener("click", () => {
      const filteredWorks = works.filter(
        (work) => work.categoryId === category.id
      );
      displayWorks(filteredWorks);
      setActiveFilter(button);
    });
    filterContainer.appendChild(button);
  });

  title.insertAdjacentElement("afterend", filterContainer);
}

function setActiveFilter(activeButton) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  activeButton.classList.add("active");
}

async function initGallery() {
  const works = await fetchWorks();
  const categories = await fetchCategories();

  displayWorks(works);

  // Check if user is logged in
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    // User is logged in - show edit button, hide filters
    showEditButton();
    updateNavigation();
  } else {
    // User not logged in - show filters
    createFilterButtons(categories, works);
  }
}

function showEditButton() {
  const portfolioTitle = document.querySelector("#portfolio h2");
  if (portfolioTitle) {
    const editDiv = document.createElement("div");
    editDiv.className = "edit-btn";
    editDiv.innerHTML = `
            <i class="fa-regular fa-pen-to-square"></i>
            <span class="edit-text">Edit</span>
        `;
    editDiv.onclick = openModal;

    // Add the edit button right after the h2 text
    portfolioTitle.appendChild(editDiv);
  }
}

function updateNavigation() {
  const loginLink = document.querySelector('nav a[href="login.html"]');
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.href = "#";
    loginLink.onclick = function (e) {
      e.preventDefault();
      logout();
    };
  }
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  window.location.reload();
}

function openModal() {
  console.log("Edit button clicked");
}

// event listener waits for the page to load
document.addEventListener("DOMContentLoaded", initGallery);
