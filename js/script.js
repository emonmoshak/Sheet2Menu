document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        menuItems: [],
        cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
        selectedCategory: 'all',
        searchQuery: '',
        isLoading: false,
        categories: [],
        config: {},
        sheetsAPI: null,
        lastDataFetch: null
    };

    // --- GOOGLE SHEETS INTEGRATION ---
    const initializeGoogleSheets = () => {
        if (window.CONFIG && window.CONFIG.GOOGLE_SHEETS.ENABLED && window.SheetsAPI) {
            state.sheetsAPI = new window.SheetsAPI(
                window.CONFIG.GOOGLE_SHEETS.API_KEY,
                window.CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID
            );
            return true;
        }
        return false;
    };

    const loadDataFromSheets = async () => {
        if (!state.sheetsAPI) {
            console.log('Google Sheets not configured, using fallback data');
            loadFallbackData();
            return;
        }

        try {
            showToast('Loading menu from Google Sheets...', 'ri-refresh-line');
            
            const { items, categories, config } = await state.sheetsAPI.getAllData();
            
            state.menuItems = items;
            state.categories = categories;
            state.config = config;
            state.lastDataFetch = Date.now();
            
            // Update restaurant name if available
            if (config.restaurantName) {
                const titleElement = document.querySelector('title');
                if (titleElement) {
                    titleElement.textContent = `${config.restaurantName} - Digital Menu`;
                }
                
                const heroTitle = document.querySelector('.hero h1');
                if (heroTitle) {
                    heroTitle.textContent = config.restaurantName;
                }
            }
            
            showToast('Menu updated successfully!', 'ri-check-line');
            console.log('Data loaded from Google Sheets:', { items: items.length, categories: categories.length });
            
            // Debug: Log the actual data structure
            if (window.CONFIG && window.CONFIG.APP.DEBUG) {
                console.log('DEBUG - Raw items data:', items);
                console.log('DEBUG - First item structure:', items[0]);
                console.log('DEBUG - Categories data:', categories);
            }
            
        } catch (error) {
            console.error('Error loading data from Google Sheets:', error);
            showToast('Failed to load from Google Sheets, using offline data', 'ri-error-warning-line');
            loadFallbackData();
        }
    };

    const loadFallbackData = () => {
        // Use fallback data when Google Sheets is not available
        const fallbackItems = [
            { id: 'calamari', name: 'Crispy Calamari', desc: 'Tender calamari, lightly battered and fried.', price: 12.99, stock: 'in', image: '/assets/images/food/Crispy Calamari.jpg', category: 'starters' },
            { id: 'bruschetta', name: 'Bruschetta Platter', desc: 'Toasted bread with tomatoes, basil, and garlic.', price: 9.99, stock: 'low', image: '/assets/images/food/Bruschetta Platter.jpeg', category: 'starters' },
            { id: 'margherita', name: 'Margherita Pizza', desc: 'Classic pizza with fresh mozzarella and basil.', price: 15.50, stock: 'in', image: '/assets/images/food/Margherita Pizza.jpeg', category: 'main-dishes' },
            { id: 'pasta', name: 'Spaghetti Carbonara', desc: 'Pasta with creamy egg sauce, pancetta, and cheese.', price: 16.00, stock: 'in', image: '/assets/images/food/Spaghetti Carbonara.jpg', category: 'main-dishes' },
            { id: 'tiramisu', name: 'Tiramisu', desc: 'A coffee-flavored Italian dessert.', price: 8.50, stock: 'out', image: '/assets/images/food/Tiramisu.jpg', category: 'desserts' },
            { id: 'cheesecake', name: 'Cheesecake Slice', desc: 'Creamy cheesecake with a graham cracker crust.', price: 7.99, stock: 'in', image: '/assets/images/food/Cheesecake Slice.jpeg', category: 'desserts' },
            { id: 'lemonade', name: 'Fresh Lemonade', desc: 'House-made lemonade, sweet and tangy.', price: 4.50, stock: 'in', image: '/assets/images/food/Fresh Lemonade.webp', category: 'drinks' },
            { id: 'steak', name: 'Ribeye Steak', desc: '12oz ribeye, cooked to perfection.', price: 29.99, stock: 'in', image: '/assets/images/food/Ribeye Steak.jpg', category: 'specials' }
        ];
        
        const fallbackCategories = [
            { id: 'all', name: 'All', image: '/assets/images/categories/All Category Image.png' },
            { id: 'starters', name: 'Starters', image: '/assets/images/categories/Starters Image.png' },
            { id: 'main-dishes', name: 'Main Dishes', image: '/assets/images/categories/Main Dishes Image.png' },
            { id: 'desserts', name: 'Desserts', image: '/assets/images/categories/Desserts Image.png' },
            { id: 'drinks', name: 'Drinks', image: '/assets/images/categories/Drinks Image.png' },
            { id: 'specials', name: 'Specials', image: '/assets/images/categories/Specials Image.png' }
        ];
        
        state.menuItems = fallbackItems;
        state.categories = fallbackCategories;
        state.config = window.CONFIG ? window.CONFIG.RESTAURANT : { NAME: 'Taste Haven' };
    };

    // Refresh data periodically
    const setupAutoRefresh = () => {
        if (state.sheetsAPI && window.CONFIG) {
            const refreshInterval = (window.CONFIG.APP.REFRESH_INTERVAL || 5) * 60 * 1000; // Convert to milliseconds
            setInterval(async () => {
                try {
                    await loadDataFromSheets();
                    renderCategories();
                    renderFoodItems();
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                }
            }, refreshInterval);
        }
    };

    // --- SELECTORS ---
    const foodItemsContainer = document.querySelector('.food-items');
    const categorySelectorContainer = document.querySelector('.category-selector');
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cartIcon = document.querySelector('.cart-icon');
    const cartSummary = document.querySelector('.cart-summary');
    const cartSummaryCount = document.querySelector('.cart-summary .cart-item-count');
    const cartSummaryPrice = document.querySelector('.cart-summary .cart-total-price');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const loadingSkeleton = document.getElementById('loading-skeleton');

    // --- UTILITY FUNCTIONS ---
    const filterItems = () => {
        let filteredItems = state.menuItems;
        
        // Filter by category
        if (state.selectedCategory !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === state.selectedCategory);
        }
        
        // Filter by search query
        if (state.searchQuery.trim()) {
            const query = state.searchQuery.toLowerCase().trim();
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.desc.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        }
        
        return filteredItems;
    };

    const showToast = (message, icon = 'ri-check-line') => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // --- RENDER FUNCTIONS ---
    const renderFoodItems = () => {
        if (!foodItemsContainer) return;
        
        // Show loading skeleton
        if (loadingSkeleton) {
            loadingSkeleton.classList.remove('hidden');
        }
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            foodItemsContainer.innerHTML = '';
            const filteredItems = filterItems();
            
            // Hide loading skeleton
            if (loadingSkeleton) {
                loadingSkeleton.classList.add('hidden');
            }
            
            if (filteredItems.length === 0) {
                foodItemsContainer.innerHTML = `
                    <div class="no-results">
                        <i class="ri-search-line"></i>
                        <h3>No items found</h3>
                        <p>Try adjusting your search or category filter</p>
                    </div>
                `;
                return;
            }

            filteredItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'food-card';
                card.dataset.itemId = item.id; // Set the item ID on the card itself
                card.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="food-img" 
                         onerror="this.src='https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000); console.log('Image failed to load:', '${item.image}');"
                         onload="console.log('Image loaded successfully:', '${item.image}');">
                    <div class="food-info">
                        <h3 class="food-name">${item.name}</h3>
                        <p class="food-desc">${item.desc}</p>
                        <div class="food-meta">
                            <span class="food-price">$${item.price.toFixed(2)}</span>
                            <span class="stock ${item.stock}-stock">${item.stock.replace('-', ' ')}</span>
                        </div>
                        <div class="food-actions">
                            <button class="btn btn-primary buy-now" ${item.stock === 'out' ? 'disabled' : ''}>Buy Now</button>
                            <button class="btn btn-secondary add-to-cart" ${item.stock === 'out' ? 'disabled' : ''}>Add to Cart</button>
                        </div>
                    </div>
                `;
                foodItemsContainer.appendChild(card);
            });
        }, 500); // 500ms delay for loading animation
    };

    const renderCategories = () => {
        if (!categorySelectorContainer) return;
        
        // Add loading state
        categorySelectorContainer.innerHTML = '';
        categorySelectorContainer.classList.add('loading');
        
        // Create categories with enhanced features
        state.categories.forEach((category, index) => {
            const card = document.createElement('div');
            card.className = `category-card ${state.selectedCategory === category.id ? 'active' : ''}`;
            card.dataset.category = category.id;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Filter by ${category.name} category`);
            card.setAttribute('aria-pressed', state.selectedCategory === category.id ? 'true' : 'false');
            
            // Add loading class for staggered animation
            card.classList.add('loading');
            
            card.innerHTML = `
                <img src="${category.image}" 
                     alt="${category.name}" 
                     class="category-img"
                     loading="lazy"
                     onerror="this.src='/assets/images/categories/default.png'">
                <div class="category-name">${category.name}</div>
            `;
            
            // Add click and keyboard event listeners
            const handleCategorySelect = (e) => {
                e.preventDefault();
                selectCategory(category.id, card);
            };
            
            card.addEventListener('click', handleCategorySelect);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategorySelect(e);
                }
            });
            
            // Add hover effects for better UX
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('active')) {
                    card.style.transform = 'translateY(-8px) scale(1.02)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('active')) {
                    card.style.transform = '';
                }
            });
            
            categorySelectorContainer.appendChild(card);
            
            // Staggered animation
            setTimeout(() => {
                card.classList.remove('loading');
            }, index * 100);
        });
        
        // Remove loading state
        setTimeout(() => {
            categorySelectorContainer.classList.remove('loading');
        }, state.categories.length * 100 + 200);
    };
    
    const selectCategory = (categoryId, cardElement) => {
        // Update state
        state.selectedCategory = categoryId;
        
        // Update UI
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
            card.setAttribute('aria-pressed', 'false');
            card.style.transform = '';
        });
        
        if (cardElement) {
            cardElement.classList.add('active');
            cardElement.setAttribute('aria-pressed', 'true');
            
            // Add selection animation
            cardElement.style.transform = 'translateY(-4px) scale(1.05)';
            
            // Scroll to selected category on mobile
            if (window.innerWidth < 768) {
                cardElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
        
        // Filter items and re-render the food items
        renderFoodItems();
        
        // Show toast for category selection
        const categoryName = state.categories.find(cat => cat.id === categoryId)?.name || 'All';
        showToast(`Showing ${categoryName} items`, 'ri-filter-3-line');
        
        // Analytics tracking (if needed)
        if (window.gtag) {
            window.gtag('event', 'category_select', {
                category_name: categoryName
            });
        }
    };

    const updateCartView = () => {
        const totalItems = state.cartItems.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = state.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

        cartCountElements.forEach(el => el.textContent = totalItems);

        if (cartSummary) {
            if (totalItems > 0) {
                cartSummary.style.display = 'flex';
                cartSummaryCount.textContent = totalItems;
                cartSummaryPrice.textContent = `$${totalPrice.toFixed(2)}`;
            } else {
                cartSummary.style.display = 'none';
            }
        }
        
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    };

    // --- ANIMATION --- 
    const flyToCartAnimation = (startElement) => {
        if (!startElement || !cartIcon) return;

        const foodCard = startElement.closest('.food-card');
        const foodImg = foodCard.querySelector('.food-img');
        if (!foodImg) return;

        const flyingImg = foodImg.cloneNode(true);
        flyingImg.classList.add('food-card-fly-to-cart');

        const startRect = foodImg.getBoundingClientRect();
        const endRect = cartIcon.getBoundingClientRect();

        flyingImg.style.left = `${startRect.left}px`;
        flyingImg.style.top = `${startRect.top}px`;
        flyingImg.style.width = `${startRect.width}px`;
        flyingImg.style.height = `${startRect.height}px`;

        document.body.appendChild(flyingImg);

        requestAnimationFrame(() => {
            const x = endRect.left + (endRect.width / 2) - (startRect.left + startRect.width / 2);
            const y = endRect.top + (endRect.height / 2) - (startRect.top + startRect.height / 2);

            flyingImg.style.transform = `translate(${x}px, ${y}px) scale(0.1)`;
            flyingImg.style.opacity = '0';
        });

        flyingImg.addEventListener('transitionend', () => {
            flyingImg.remove();
            cartIcon.classList.add('pulse');
            setTimeout(() => cartIcon.classList.remove('pulse'), 400);
        }, { once: true });
    };

    const showAddedToCartAnimation = (clickedElement) => {
        if (!clickedElement) return;

        const animationText = document.createElement('div');
        animationText.textContent = 'Added to cart';
        animationText.classList.add('added-to-cart-animation');
        document.body.appendChild(animationText);

        const buttonRect = clickedElement.getBoundingClientRect();
        animationText.style.position = 'fixed'; // Use fixed to position relative to the viewport
        animationText.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
        animationText.style.top = `${buttonRect.top}px`;
        animationText.style.transform = 'translate(-50%, 0)'; // Initial position at the button

        // Animate upwards
        requestAnimationFrame(() => {
            animationText.style.transform = 'translate(-50%, -150%)';
            animationText.style.opacity = '0';
        });

        // Remove after animation
        animationText.addEventListener('transitionend', () => {
            animationText.remove();
        }, { once: true });
    };

    // --- EVENT HANDLERS ---
    const handleAddToCart = (itemId, redirect = false, clickedElement) => {
        const item = state.menuItems.find(i => i.id === itemId);
        if (!item || item.stock === 'out') return;

        const cartItem = state.cartItems.find(i => i.id === itemId);
        if (cartItem) {
            cartItem.qty++;
        } else {
            state.cartItems.push({ ...item, qty: 1 });
        }

        if (clickedElement) {
            // "Buy Now" does the fly-to-cart animation and redirects
            // "Add to Cart" does the vanishing text animation
            if (redirect) {
                flyToCartAnimation(clickedElement);
            } else {
                showAddedToCartAnimation(clickedElement);
            }
        } else if (cartIcon) { // Fallback pulse animation
            cartIcon.classList.add('pulse');
            setTimeout(() => cartIcon.classList.remove('pulse'), 400);
        }

        updateCartView();

        if (redirect) {
            setTimeout(() => {
                window.location.href = 'add-to-cart-page.html';
            }, 500); // Delay redirect to allow fly animation to be seen
        }
    };

    // --- SEARCH FUNCTIONALITY ---
    const handleSearch = () => {
        const query = searchInput.value.trim();
        state.searchQuery = query;
        
        // Show/hide clear button
        if (clearSearchBtn) {
            clearSearchBtn.style.display = query ? 'block' : 'none';
        }
        
        renderFoodItems();
    };

    const clearSearch = () => {
        if (searchInput) {
            searchInput.value = '';
            state.searchQuery = '';
        }
        if (clearSearchBtn) {
            clearSearchBtn.style.display = 'none';
        }
        renderFoodItems();
    };

    // --- THEME TOGGLE FUNCTIONALITY ---
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
            }
        }
        
        showToast(`Switched to ${newTheme} mode`, 'ri-palette-line');
    };

    // --- BACK TO TOP FUNCTIONALITY ---
    const handleScroll = () => {
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // --- EVENT LISTENERS ---
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }

    // Scroll event for back to top button
    window.addEventListener('scroll', handleScroll);

    // Start order button smooth scroll
    const startOrderBtn = document.getElementById('start-order-btn');
    if (startOrderBtn) {
        startOrderBtn.addEventListener('click', () => {
            const foodSection = document.querySelector('.food-items');
            if (foodSection) {
                foodSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Category selection is now handled directly in renderCategories function

    if (foodItemsContainer) {
        foodItemsContainer.addEventListener('click', e => {
            const button = e.target.closest('.add-to-cart, .buy-now');
            if (!button) return;

            const card = button.closest('.food-card');
            if (!card) return; // Defensive check
            const itemId = card.dataset.itemId;
            const isBuyNow = button.classList.contains('buy-now');

            handleAddToCart(itemId, isBuyNow, button);
        });
    }
    
    const ctaButton = document.querySelector('.cta-button');
    if(ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.querySelector('.category-selector').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- INITIALIZATION ---
    const initHomePage = async () => {
        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
            }
        }
        
        // Initialize Google Sheets integration
        const sheetsEnabled = initializeGoogleSheets();
        
        // Load data from Google Sheets or fallback
        await loadDataFromSheets();
        
        // Setup auto-refresh if Google Sheets is enabled
        if (sheetsEnabled) {
            setupAutoRefresh();
        }
        
        renderCategories();
        renderFoodItems();
        updateCartView();
    };

    // Run only on the home page
    if (foodItemsContainer) {
        initHomePage();
    }
});
