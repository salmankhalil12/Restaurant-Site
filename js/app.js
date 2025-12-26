// ============================================ LOADING ANIMATION  ============================================
window.addEventListener('load', function () {
    setTimeout(function () {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }, 500);
});

// ============================================CART FUNCTIONALITY  ============================================
let cart = JSON.parse(localStorage.getItem('FoodSprintCart')) || [];

// DOM Elements
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartBody = document.getElementById('cartBody');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const toastContainer = document.getElementById('toastContainer');

// Update cart count and total
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    // Animate cart count
    cartCount.classList.add('bump');
    setTimeout(() => cartCount.classList.remove('bump'), 300);

    // Save to localStorage
    localStorage.setItem('FoodSprintCart', JSON.stringify(cart));

    // Render cart items
    renderCartItems();
}

// Render cart items
function renderCartItems() {
    if (cart.length === 0) {
        cartBody.innerHTML = `
          <div class="cart-empty">
            <i class="fas fa-shopping-basket"></i>
            <p>Your cart is empty</p>
            <p style="font-size: 14px; color: #999;">Add some delicious food!</p>
          </div>
        `;
        return;
    }

    cartBody.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.img}" alt="${item.name}">
          <div class="cart-item-details">
            <h5>${item.name}</h5>
            <span class="price">$${(item.price * item.quantity).toFixed(2)}</span>
            <div class="quantity-controls">
              <button class="decrease-qty" data-id="${item.id}">
                <i class="fas fa-minus"></i>
              </button>
              <span>${item.quantity}</span>
              <button class="increase-qty" data-id="${item.id}">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          <button class="remove-item" data-id="${item.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `).join('');

    // Add event listeners for quantity controls
    document.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const item = cart.find(item => item.id === id);
            if (item) {
                item.quantity++;
                updateCartUI();
            }
        });
    });

    document.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const item = cart.find(item => item.id === id);
            if (item && item.quantity > 1) {
                item.quantity--;
                updateCartUI();
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            cart = cart.filter(item => item.id !== id);
            updateCartUI();
            showToast('Item Removed', 'Item has been removed from your cart', 'error');
        });
    });
}

// Add to cart function
function addToCart(id, name, price, img) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price: parseFloat(price), img, quantity: 1 });
    }

    updateCartUI();
    showToast('Added to Cart', `${name} has been added to your cart`, 'success');
}

// Show toast notification
function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <div class="toast-content">
          <h5>${title}</h5>
          <p>${message}</p>
        </div>
      `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Toggle cart sidebar
cartToggle.addEventListener('click', (e) => {
    e.preventDefault();
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
});

cartOverlay.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Add to cart button event listeners
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = this.dataset.price;
        const img = this.dataset.img;

        addToCart(id, name, price, img);

        // Button animation
        this.classList.add('added');
        this.innerHTML = '<i class="fas fa-check"></i>';

        setTimeout(() => {
            this.classList.remove('added');
            this.innerHTML = '<i class="fas fa-shopping-cart"></i>';
        }, 1500);
    });
});

// Checkout button
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Cart Empty', 'Please add items to your cart first', 'error');
        return;
    }
    showToast('Checkout', 'Redirecting to payment...', 'success');
    // Add checkout logic here
});

// Initialize cart UI
updateCartUI();

// ============================================ SEARCH FUNCTIONALITY ============================================
const searchToggle = document.getElementById('searchToggle');
const searchBox = document.getElementById('searchBox');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Food items data for search
const foodItems = [];
document.querySelectorAll('.food_section .grid > div').forEach(item => {
    const name = item.dataset.name;
    const price = item.dataset.price;
    const category = item.dataset.category;
    const img = item.querySelector('img').src;
    const id = item.querySelector('.add-to-cart-btn').dataset.id;

    if (name) {
        foodItems.push({ id, name, price, category, img });
    }
});

// Toggle search box
searchToggle.addEventListener('click', (e) => {
    e.preventDefault();
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
        searchInput.focus();
    }
});

// Close search box when clicking outside
document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && e.target !== searchToggle && !searchToggle.contains(e.target)) {
        searchBox.classList.remove('active');
    }
});

// Search input handler
searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();

    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }

    const filtered = foodItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        searchResults.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No items found</p></div>';
        return;
    }

    searchResults.innerHTML = filtered.map(item => `
        <div class="search-result-item" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-img="${item.img}">
          <img src="${item.img}" alt="${item.name}">
          <div>
            <h6>${item.name}</h6>
            <span>$${item.price}</span>
          </div>
        </div>
      `).join('');

    // Add click handler to search results
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function () {
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = this.dataset.price;
            const img = this.dataset.img;

            addToCart(id, name, price, img);
            searchBox.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    });
});

// ============================================  HEADER SCROLL EFFECT ============================================
window.addEventListener('scroll', function () {
    const header = document.querySelector('.header_section');
    const scrollTop = document.getElementById('scrollTop');

    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        scrollTop.classList.add('active');
    } else {
        header.classList.remove('scrolled');
        scrollTop.classList.remove('active');
    }
});

// Scroll to top
document.getElementById('scrollTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================ ISOTOPE FILTER ============================================
$(document).ready(function () {
    var $grid = $('.grid').isotope({
        itemSelector: '.all',
        percentPosition: true,
        masonry: {
            columnWidth: '.all'
        }
    });

    $('.filters_menu li').click(function () {
        $('.filters_menu li').removeClass('active');
        $(this).addClass('active');

        var filterValue = $(this).attr('data-filter');
        $grid.isotope({ filter: filterValue });
    });

    // Carousel
    $('.client_owl-carousel').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        dots: true,
        autoplay: true,
        autoplayTimeout: 5000,
        responsive: {
            0: { items: 1 },
            768: { items: 2 },
            1000: { items: 3 }
        }
    });
});

// ============================================ FORM SUBMISSION ============================================
document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault();
    showToast('Booking Confirmed!', 'We will contact you shortly to confirm your reservation.', 'success');
    this.reset();
});

// ============================================ SMOOTH SCROLL ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// ============================================ INTERSECTION OBSERVER FOR ANIMATIONS ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.food_section .box').forEach(box => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(30px)';
    box.style.transition = 'all 0.6s ease';
    observer.observe(box);
});

// Set current year in footer
document.getElementById('displayYear').textContent = new Date().getFullYear();
