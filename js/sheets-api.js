/**
 * Google Sheets API Integration for Restaurant Menu CMS
 * This file handles all Google Sheets operations for dynamic menu management
 */

class SheetsAPI {
    constructor(apiKey, spreadsheetId) {
        this.apiKey = apiKey;
        this.spreadsheetId = spreadsheetId;
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        this.cache = {
            items: null,
            categories: null,
            config: null,
            lastFetch: null
        };
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Fetch data from a specific sheet
     */
    async fetchSheet(sheetName, range = '') {
        try {
            const fullRange = range ? `${sheetName}!${range}` : sheetName;
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${fullRange}?key=${this.apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error(`Error fetching sheet ${sheetName}:`, error);
            throw error;
        }
    }

    /**
     * Convert sheet rows to objects using first row as headers
     */
    rowsToObjects(rows) {
        if (!rows || rows.length < 2) return [];
        
        const headers = rows[0].map(header => header.toLowerCase().trim());
        return rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
    }

    /**
     * Fetch and parse menu items
     */
    async getMenuItems(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('items')) {
            return this.cache.items;
        }

        try {
            const rows = await this.fetchSheet('Items');
            console.log('DEBUG - Raw sheet rows:', rows);
            
            const rawItems = this.rowsToObjects(rows);
            console.log('DEBUG - Raw items after conversion:', rawItems);
            
            const items = rawItems.map(item => {
                // Handle different possible column names and ensure proper data types
                const processedItem = {
                    id: this.generateId(item.name || item.Name || ''),
                    name: item.name || item.Name || '',
                    desc: item.description || item.Description || item.desc || item.Desc || '',
                    price: this.parsePrice(item.price || item.Price || '0'),
                    category: (item.category || item.Category || 'main-dishes').toLowerCase().replace(/\s+/g, '-'),
                    image: this.validateImageUrl(item.image || item.Image || ''),
                    stock: (item.stock || item.Stock || 'in').toLowerCase()
                };
                
                console.log('DEBUG - Processed item:', processedItem);
                return processedItem;
            });

            this.cache.items = items;
            this.cache.lastFetch = Date.now();
            return items;
        } catch (error) {
            console.error('Error fetching menu items:', error);
            return this.getFallbackItems();
        }
    }

    /**
     * Parse price ensuring it's a valid number
     */
    parsePrice(priceValue) {
        if (typeof priceValue === 'number') return priceValue;
        if (typeof priceValue === 'string') {
            // Remove currency symbols and parse
            const cleanPrice = priceValue.replace(/[$£€¥,]/g, '').trim();
            const parsed = parseFloat(cleanPrice);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }

    /**
     * Validate and fix image URLs
     */
    validateImageUrl(imageUrl) {
        if (!imageUrl || imageUrl.trim() === '') {
            console.log('DEBUG - Empty image URL, using placeholder');
            return 'https://picsum.photos/300/200?random=1';
        }
        
        const url = imageUrl.trim();
        console.log('DEBUG - Processing image URL:', url);
        
        // Handle Dropbox URLs - Convert to direct download links
        if (url.includes('dropbox.com')) {
            // Convert Dropbox sharing URL to direct download URL
            const directUrl = url.replace('?dl=0', '?dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
            console.log('DEBUG - Fixed Dropbox URL:', directUrl);
            return directUrl;
        }
        
        // Handle Imgur URLs
        if (url.includes('imgur.com')) {
            // Ensure it's a direct image link
            if (!url.includes('.jpg') && !url.includes('.png') && !url.includes('.gif') && !url.includes('.webp')) {
                // Try to convert imgur page to direct image
                const imgurId = url.split('/').pop();
                const directUrl = `https://i.imgur.com/${imgurId}.jpg`;
                console.log('DEBUG - Fixed Imgur URL:', directUrl);
                return directUrl;
            }
            console.log('DEBUG - Using Imgur URL as-is:', url);
            return url;
        }
        
        // Handle Google Drive URLs
        if (url.includes('drive.google.com/file/d/')) {
            const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
            if (fileId) {
                const fixedUrl = `https://drive.google.com/uc?id=${fileId[1]}`;
                console.log('DEBUG - Fixed Google Drive URL:', fixedUrl);
                return fixedUrl;
            }
        }
        
        // Handle Google Drive sharing URLs (different format)
        if (url.includes('drive.google.com') && url.includes('id=')) {
            const fileId = url.match(/id=([a-zA-Z0-9-_]+)/);
            if (fileId) {
                const fixedUrl = `https://drive.google.com/uc?id=${fileId[1]}`;
                console.log('DEBUG - Fixed Google Drive sharing URL:', fixedUrl);
                return fixedUrl;
            }
        }
        
        // Handle Unsplash URLs
        if (url.includes('unsplash.com')) {
            console.log('DEBUG - Using Unsplash URL:', url);
            return url;
        }
        
        // Handle Picsum (Lorem Picsum) URLs
        if (url.includes('picsum.photos')) {
            console.log('DEBUG - Using Picsum URL:', url);
            return url;
        }
        
        // Return as-is if it looks like a valid direct image URL
        if (url.startsWith('http://') || url.startsWith('https://')) {
            console.log('DEBUG - Using direct URL:', url);
            return url;
        }
        
        // Handle relative URLs
        if (url.startsWith('/')) {
            console.log('DEBUG - Using relative URL:', url);
            return url;
        }
        
        // If nothing matches, use a random image placeholder
        console.log('DEBUG - Invalid URL format, using random placeholder');
        const randomId = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/300/200?random=${randomId}`;
    }

    /**
     * Fetch and parse categories
     */
    async getCategories(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('categories')) {
            return this.cache.categories;
        }

        try {
            const rows = await this.fetchSheet('Categories');
            const categories = this.rowsToObjects(rows).map(cat => {
                const rawImage = cat.background || cat.image || cat.Background || cat.Image || '';
                console.log('DEBUG - Processing category image:', rawImage);
                return {
                    id: this.generateId(cat.name),
                    name: cat.name || cat.Name || '',
                    image: this.validateImageUrl(rawImage)
                };
            });

            // Always include 'All' category at the beginning
            const allCategories = [
                { id: 'all', name: 'All', image: '/assets/images/categories/All Category Image.png' },
                ...categories
            ];

            this.cache.categories = allCategories;
            this.cache.lastFetch = Date.now();
            return allCategories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return this.getFallbackCategories();
        }
    }

    /**
     * Fetch and parse restaurant config
     */
    async getConfig(forceRefresh = false) {
        if (!forceRefresh && this.isCacheValid('config')) {
            return this.cache.config;
        }

        try {
            const rows = await this.fetchSheet('Config');
            const configArray = this.rowsToObjects(rows);
            
            // Convert array to object
            const config = {};
            configArray.forEach(row => {
                if (row.key && row.value) {
                    config[row.key.toLowerCase()] = row.value;
                }
            });

            this.cache.config = {
                restaurantName: config.restaurant_name || 'Taste Haven',
                contactNumber: config.contact_number || '',
                delivery: config.delivery || 'Yes',
                whatsappNumber: config.whatsapp_number || '',
                currency: config.currency || '$',
                taxRate: parseFloat(config.tax_rate) || 0.1
            };

            this.cache.lastFetch = Date.now();
            return this.cache.config;
        } catch (error) {
            console.error('Error fetching config:', error);
            return this.getFallbackConfig();
        }
    }

    /**
     * Fetch all data at once
     */
    async getAllData(forceRefresh = false) {
        try {
            const [items, categories, config] = await Promise.all([
                this.getMenuItems(forceRefresh),
                this.getCategories(forceRefresh),
                this.getConfig(forceRefresh)
            ]);

            return { items, categories, config };
        } catch (error) {
            console.error('Error fetching all data:', error);
            throw error;
        }
    }

    /**
     * Check if cache is still valid
     */
    isCacheValid(type) {
        return this.cache[type] && 
               this.cache.lastFetch && 
               (Date.now() - this.cache.lastFetch) < this.cacheTimeout;
    }

    /**
     * Generate consistent ID from name
     */
    generateId(name) {
        return name.toLowerCase()
                  .replace(/[^a-z0-9\s]/g, '')
                  .replace(/\s+/g, '-')
                  .trim();
    }

    /**
     * Fallback data if sheets are unavailable
     */
    getFallbackItems() {
        return [
            { id: 'calamari', name: 'Crispy Calamari', desc: 'Tender calamari, lightly battered and fried.', price: 12.99, stock: 'in', image: '/assets/images/food/Crispy Calamari.jpg', category: 'starters' },
            { id: 'bruschetta', name: 'Bruschetta Platter', desc: 'Toasted bread with tomatoes, basil, and garlic.', price: 9.99, stock: 'low', image: '/assets/images/food/Bruschetta Platter.jpeg', category: 'starters' },
            { id: 'margherita', name: 'Margherita Pizza', desc: 'Classic pizza with fresh mozzarella and basil.', price: 15.50, stock: 'in', image: '/assets/images/food/Margherita Pizza.jpeg', category: 'main-dishes' },
            { id: 'pasta', name: 'Spaghetti Carbonara', desc: 'Pasta with creamy egg sauce, pancetta, and cheese.', price: 16.00, stock: 'in', image: '/assets/images/food/Spaghetti Carbonara.jpg', category: 'main-dishes' },
            { id: 'tiramisu', name: 'Tiramisu', desc: 'A coffee-flavored Italian dessert.', price: 8.50, stock: 'out', image: '/assets/images/food/Tiramisu.jpg', category: 'desserts' },
            { id: 'cheesecake', name: 'Cheesecake Slice', desc: 'Creamy cheesecake with a graham cracker crust.', price: 7.99, stock: 'in', image: '/assets/images/food/Cheesecake Slice.jpeg', category: 'desserts' },
            { id: 'lemonade', name: 'Fresh Lemonade', desc: 'House-made lemonade, sweet and tangy.', price: 4.50, stock: 'in', image: '/assets/images/food/Fresh Lemonade.webp', category: 'drinks' },
            { id: 'steak', name: 'Ribeye Steak', desc: '12oz ribeye, cooked to perfection.', price: 29.99, stock: 'in', image: '/assets/images/food/Ribeye Steak.jpg', category: 'specials' }
        ];
    }

    getFallbackCategories() {
        return [
            { id: 'all', name: 'All', image: '/assets/images/categories/All Category Image.png' },
            { id: 'starters', name: 'Starters', image: '/assets/images/categories/Starters Image.png' },
            { id: 'main-dishes', name: 'Main Dishes', image: '/assets/images/categories/Main Dishes Image.png' },
            { id: 'desserts', name: 'Desserts', image: '/assets/images/categories/Desserts Image.png' },
            { id: 'drinks', name: 'Drinks', image: '/assets/images/categories/Drinks Image.png' },
            { id: 'specials', name: 'Specials', image: '/assets/images/categories/Specials Image.png' }
        ];
    }

    getFallbackConfig() {
        return {
            restaurantName: 'Taste Haven',
            contactNumber: '',
            delivery: 'Yes',
            whatsappNumber: '',
            currency: '$',
            taxRate: 0.1
        };
    }

    /**
     * Clear cache to force refresh
     */
    clearCache() {
        this.cache = {
            items: null,
            categories: null,
            config: null,
            lastFetch: null
        };
    }
}

// Export for use in other files
window.SheetsAPI = SheetsAPI;
