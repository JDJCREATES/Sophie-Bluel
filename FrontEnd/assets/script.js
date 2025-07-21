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


  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    // user is logged in - show edit button, hide filters
    showEditButton();
    updateNavigation();
  } else {
  
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
  let modal = document.getElementById('modal');
  if (!modal) {
    console.error('Modal not found in DOM');
    return;
  }
  
  // Reset modal to gallery view
  document.getElementById('modal-gallery').style.display = 'block';
  document.getElementById('modal-add-photo').style.display = 'none';
  document.getElementById('btn-back').style.display = 'none';
  
  // Reset form
  resetAddPhotoForm();
  
  modal.style.display = 'flex';
  loadModalGallery();
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function loadModalGallery() {
  const works = await fetchWorks();
  const galleryModal = document.getElementById('gallery-modal');

  if (!galleryModal) return;
  
  galleryModal.innerHTML = '';
  
  works.forEach(work => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <button class="btn-delete" data-id="${work.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    galleryModal.appendChild(figure);
  });
  
  // Add delete functionality
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const workId = e.currentTarget.dataset.id;
      deleteWork(workId);
    });
  });
}

async function deleteWork(workId) {
  const authToken = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_URL}/works/${workId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      // Refresh both galleries
      loadModalGallery();
      const works = await fetchWorks();
      displayWorks(works);
    }
  } catch (error) {
    console.error('Error deleting work:', error);
  }
}

// event listener waits for the page to load
document.addEventListener("DOMContentLoaded", () => {
  initGallery();
  
  // Modal close functionality
  const closeBtn = document.getElementById('btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Close modal when clicking outside
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  // Add photo button - switch to add photo view
  const addPhotoBtn = document.getElementById('btn-add-photo');
  if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', () => {
      document.getElementById('modal-gallery').style.display = 'none';
      document.getElementById('modal-add-photo').style.display = 'block';
      document.getElementById('btn-back').style.display = 'block';
      loadCategories(); // Load categories when switching to add photo view
    });
  }
  
  // Back button - return to gallery view
  const backBtn = document.getElementById('btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      resetAddPhotoForm();
      document.getElementById('modal-add-photo').style.display = 'none';
      document.getElementById('modal-gallery').style.display = 'block';
      document.getElementById('btn-back').style.display = 'none';
    });
  }
  
  // File input handling
  const fileInput = document.getElementById('file-input');
  const uploadArea = document.getElementById('upload-area');
  const uploadLabel = document.querySelector('.btn-upload');
  const removePhotoBtn = document.getElementById('btn-remove-photo');
  const addPhotoForm = document.getElementById('form-add-photo');
  
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', removePhoto);
  }
  
  if (addPhotoForm) {
    addPhotoForm.addEventListener('submit', handleFormSubmit);
    addPhotoForm.addEventListener('input', validateForm);
    addPhotoForm.addEventListener('change', validateForm);
  }
});

// Handle file selection and preview
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    // Validate file type and size
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      showError('Please select a JPG or PNG image.');
      return;
    }
    
    if (file.size > 4 * 1024 * 1024) { // 4MB limit
      showError('File size must be less than 4MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('preview-img').src = e.target.result;
      document.getElementById('upload-area').style.display = 'none';
      document.getElementById('photo-preview').style.display = 'block';
      validateForm();
    };
    reader.readAsDataURL(file);
  }
}

// Remove photo preview
function removePhoto() {
  document.getElementById('file-input').value = '';
  document.getElementById('upload-area').style.display = 'flex';
  document.getElementById('photo-preview').style.display = 'none';
  validateForm();
}

// Load categories into select dropdown
async function loadCategories() {
  const categories = await fetchCategories();
  const categorySelect = document.getElementById('category');
  
  if (categorySelect && categories.length > 0) {
    categorySelect.innerHTML = '<option value="">Select a category</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
}

// Validate form and enable/disable submit button
function validateForm() {
  const fileInput = document.getElementById('file-input');
  const title = document.getElementById('title');
  const category = document.getElementById('category');
  const validateBtn = document.getElementById('btn-validate');
  
  // Clear any existing error messages
  clearError();
  
  // Check if all required fields are filled
  const hasFile = fileInput && fileInput.files.length > 0;
  const hasTitle = title && title.value.trim() !== '';
  const hasCategory = category && category.value !== '';
  
  const isValid = hasFile && hasTitle && hasCategory;
  
  if (validateBtn) {
    validateBtn.disabled = !isValid;
    validateBtn.style.backgroundColor = isValid ? '#1d6154' : '#a7a7a7';
  }
  
  return isValid;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Final validation before submission
  if (!validateForm()) {
    showError('Please fill in all required fields.');
    return;
  }
  
  const formData = new FormData();
  const fileInput = document.getElementById('file-input');
  const title = document.getElementById('title');
  const category = document.getElementById('category');
  
  // Prepare form data
  formData.append('image', fileInput.files[0]);
  formData.append('title', title.value.trim());
  formData.append('category', category.value);
  
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    showError('You must be logged in to add a project.');
    return;
  }
  
  try {
    // Disable submit button during submission
    const validateBtn = document.getElementById('btn-validate');
    if (validateBtn) {
      validateBtn.disabled = true;
      validateBtn.textContent = 'Adding...';
    }
    
    const response = await fetch(`${API_URL}/works`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    
    if (response.ok) {
      const newWork = await response.json();
      
      // Success! Add the new work to both galleries dynamically
      addWorkToGallery(newWork);
      addWorkToModalGallery(newWork);
      
      // Reset form and return to gallery view
      resetAddPhotoForm();
      document.getElementById('modal-add-photo').style.display = 'none';
      document.getElementById('modal-gallery').style.display = 'block';
      document.getElementById('btn-back').style.display = 'none';
      
      showSuccess('Project added successfully!');
      
    } else {
      const errorData = await response.json();
      showError(errorData.message || 'Error adding project. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    showError('Network error. Please check your connection and try again.');
  } finally {
    // Re-enable submit button
    const validateBtn = document.getElementById('btn-validate');
    if (validateBtn) {
      validateBtn.disabled = false;
      validateBtn.textContent = 'Confirm';
    }
  }
}

// Add new work to main gallery (Step 3.4 requirement)
function addWorkToGallery(work) {
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    const figure = document.createElement('figure');
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(figure);
  }
}

// Add new work to modal gallery (Step 3.4 requirement)
function addWorkToModalGallery(work) {
  const galleryModal = document.getElementById('gallery-modal');
  if (galleryModal) {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <button class="btn-delete" data-id="${work.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    
    // Add delete functionality to the new item
    const deleteBtn = figure.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', (e) => {
      const workId = e.currentTarget.dataset.id;
      deleteWork(workId);
    });
    
    galleryModal.appendChild(figure);
  }
}

// Reset the add photo form
function resetAddPhotoForm() {
  const form = document.getElementById('form-add-photo');
  if (form) {
    form.reset();
  }
  
  // Reset file preview
  document.getElementById('upload-area').style.display = 'flex';
  document.getElementById('photo-preview').style.display = 'none';
  
  // Reset validation
  validateForm();
  clearError();
}

// Show error message
function showError(message) {
  clearError();
  const modalContent = document.querySelector('.modal-content');
  if (modalContent) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#d65353';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.marginBottom = '20px';
    errorDiv.style.fontFamily = 'Work Sans';
    errorDiv.textContent = message;
    modalContent.insertBefore(errorDiv, modalContent.firstChild);
  }
}

// Show success message
function showSuccess(message) {
  clearError();
  const modalContent = document.querySelector('.modal-content');
  if (modalContent) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.color = '#1d6154';
    successDiv.style.textAlign = 'center';
    successDiv.style.marginBottom = '20px';
    successDiv.style.fontFamily = 'Work Sans';
    successDiv.textContent = message;
    modalContent.insertBefore(successDiv, modalContent.firstChild);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }
}

// Clear error/success messages
function clearError() {
  const existingMessages = document.querySelectorAll('.error-message, .success-message');
  existingMessages.forEach(msg => msg.remove());
}
