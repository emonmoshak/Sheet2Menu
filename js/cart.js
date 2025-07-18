document.addEventListener('DOMContentLoaded', () => {
    // --- STATE (from localStorage) ---
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let appliedDiscount = 0; // State for applied discount

    // --- SELECTORS ---
    const cartItemsListContainer = document.querySelector('.cart-items-list');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTax = document.getElementById('summary-tax');

    const summaryTotal = document.getElementById('summary-total');
    const promoInput = document.getElementById('promo-input');
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const promoMessage = document.getElementById('promo-message');
    const customerNameInput = document.getElementById('customer-name');
    const tableNumberInput = document.getElementById('table-number');
    const orderSuccessMessage = document.getElementById('order-success-message');
    const discountRow = document.querySelector('.discount-row');
    const summaryDiscount = document.getElementById('summary-discount');

    // --- RENDER FUNCTIONS ---
    const renderCartItems = () => {
        if (!cartItemsListContainer) return;

        if (cartItems.length === 0) {
            cartItemsListContainer.innerHTML = `
                <div class="empty-cart-message">
                    <h3>Your cart is empty!</h3>
                    <p>Add some delicious food from the menu to get started.</p>
                    <a href="index.html" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            return;
        }

        cartItemsListContainer.innerHTML = '';
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='/assets/images/placeholders/no-image.png'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-qty" data-id="${item.id}">-</button>
                        <span class="item-quantity">${item.qty}</span>
                        <button class="quantity-btn increase-qty" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-btn" data-id="${item.id}"><i class="ri-delete-bin-line"></i></button>
                </div>
            `;
            cartItemsListContainer.appendChild(itemElement);
        });
    };

    const updateOrderSummary = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        const tax = subtotal * 0.10;
        const discountAmount = subtotal * appliedDiscount;
        const total = subtotal + tax - discountAmount;

        if(summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if(summaryTax) summaryTax.textContent = `$${tax.toFixed(2)}`;
        if(summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;

        if (appliedDiscount > 0) {
            if(summaryDiscount) summaryDiscount.textContent = `-$${discountAmount.toFixed(2)}`;
            if(discountRow) discountRow.style.display = 'flex';
        } else {
            if(discountRow) discountRow.style.display = 'none';
        }
        
        if(checkoutBtn) {
            checkoutBtn.disabled = cartItems.length === 0;
        }
    };

    // --- EVENT HANDLERS ---
    const handleQuantityChange = (itemId, change) => {
        const item = cartItems.find(i => i.id === itemId);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) {
                cartItems = cartItems.filter(i => i.id !== itemId);
            }
        }
        saveAndReRender();
    };

    const handleRemoveItem = (itemId) => {
        cartItems = cartItems.filter(i => i.id !== itemId);
        saveAndReRender();
    };

    const saveAndReRender = () => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        renderCartItems();
        updateOrderSummary();
        // Also update the global cart count if it exists on the page
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
        cartCountElements.forEach(el => el.textContent = totalItems);
    };

    // --- EVENT LISTENERS ---
    if (cartItemsListContainer) {
        cartItemsListContainer.addEventListener('click', e => {
            const target = e.target;
            const itemId = target.closest('[data-id]')?.dataset.id;
            if (!itemId) return;

            if (target.matches('.increase-qty')) {
                handleQuantityChange(itemId, 1);
            } else if (target.matches('.decrease-qty')) {
                handleQuantityChange(itemId, -1);
            } else if (target.closest('.remove-btn')) {
                handleRemoveItem(itemId);
            }
        });
    }

    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', () => {
            const promoCodes = {
                'WELCOME10': 0.10,
                'EMON10': 0.10
            };
            const enteredCode = promoInput.value.toUpperCase();

            if (promoCodes[enteredCode]) {
                appliedDiscount = promoCodes[enteredCode];
                updateOrderSummary();
                promoMessage.textContent = 'Promo code applied successfully!';
                promoMessage.className = 'success';
                applyPromoBtn.disabled = true;
                promoInput.disabled = true;
            } else {
                promoMessage.textContent = 'Invalid promo code.';
                promoMessage.className = 'error';
                setTimeout(() => {
                    promoMessage.textContent = '';
                    promoMessage.className = '';
                }, 3000);
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const customerName = customerNameInput.value.trim();
            const tableNumber = tableNumberInput.value.trim();

            if (cartItems.length === 0) {
                promoMessage.textContent = 'Your cart is empty.';
                promoMessage.className = 'error';
                return;
            }

            if (!customerName || !tableNumber) {
                promoMessage.textContent = 'Please enter your name and table number.';
                promoMessage.className = 'error';
                return;
            }

            // Generate WhatsApp order message
            sendOrderViaWhatsApp(customerName, tableNumber, cartItems);
        });
    }

    // --- WHATSAPP INTEGRATION ---
    const sendOrderViaWhatsApp = (customerName, tableNumber, orderItems) => {
        // Get WhatsApp configuration
        const config = window.WHATSAPP_CONFIG || {};
        const restaurantWhatsApp = config.restaurantNumber || '1234567890';
        const restaurantName = config.restaurantName || 'Restaurant';
        const settings = config.messageSettings || {};
        const taxRate = settings.taxRate || 0.1;
        
        // Calculate totals
        const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const tax = subtotal * taxRate;
        const discount = appliedDiscount;
        const total = subtotal + tax - discount;
        
        // Format order details
        let orderMessage = `🍽️ *New Order from ${customerName}*\n`;
        orderMessage += `📍 *Table:* ${tableNumber}\n\n`;
        orderMessage += `📋 *Order Details:*\n`;
        
        orderItems.forEach((item, index) => {
            orderMessage += `${index + 1}. ${item.name}\n`;
            orderMessage += `   Qty: ${item.qty} × $${item.price.toFixed(2)} = $${(item.price * item.qty).toFixed(2)}\n\n`;
        });
        
        orderMessage += `💰 *Order Summary:*\n`;
        orderMessage += `Subtotal: $${subtotal.toFixed(2)}\n`;
        orderMessage += `Tax (10%): $${tax.toFixed(2)}\n`;
        if (discount > 0) {
            orderMessage += `Discount: -$${discount.toFixed(2)}\n`;
        }
        orderMessage += `*Total: $${total.toFixed(2)}*\n\n`;
        orderMessage += `⏰ Order placed at: ${new Date().toLocaleString()}\n\n`;
        orderMessage += `Please confirm this order. Thank you! 😊`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(orderMessage);
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${restaurantWhatsApp}?text=${encodedMessage}`;
        
        // Clear cart after successful order
        cartItems = [];
        appliedDiscount = 0;
        promoInput.value = '';
        customerNameInput.value = '';
        tableNumberInput.value = '';
        promoMessage.textContent = '';
        promoMessage.className = '';
        saveAndReRender();
        
        // Show success message briefly before redirect
        orderSuccessMessage.innerHTML = `<strong>Success!</strong> Redirecting to WhatsApp...`;
        orderSuccessMessage.style.display = 'block';
        
        // Redirect to WhatsApp after a short delay
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            orderSuccessMessage.style.display = 'none';
        }, 1500);
    };

    // --- INITIALIZATION ---
    const initCartPage = () => {
        renderCartItems();
        updateOrderSummary();
    };

    // Run only on the cart page
    if (cartItemsListContainer) {
        initCartPage();
    }
});
