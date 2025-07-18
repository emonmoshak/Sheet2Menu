/**
 * Configuration file for Google Sheets integration
 * Restaurant owners need to update these values with their own Google Sheets details
 */

const CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        // Get your API key from Google Cloud Console
        API_KEY: 'AIzaSyA6h9RBBqKa1Nsx94JatnviLBdD0uQyzQE',
        
        // Your Google Sheets ID (from the URL)
        SPREADSHEET_ID: '1gx2bR6p6p3LHBy8sY75WvXMuG1dQSujq0ar8S0dYjNI',
        
        // Enable/disable Google Sheets integration
        ENABLED: true // Google Sheets integration is now ACTIVE!
    },
    
    // App Configuration
    APP: {
        // Refresh interval for fetching data from Google Sheets (in minutes)
        REFRESH_INTERVAL: 5,
        
        // Enable debug logging
        DEBUG: true,
        
        // Default currency symbol
        CURRENCY: '$',
        
        // Default tax rate (10%)
        TAX_RATE: 0.1
    },
    
    // Fallback restaurant information (used when sheets are not available)
    RESTAURANT: {
        NAME: 'Taste Haven',
        CONTACT: '',
        WHATSAPP: '',
        DELIVERY: 'Yes'
    }
};

// Export configuration
window.CONFIG = CONFIG;
