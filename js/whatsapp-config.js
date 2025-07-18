// WhatsApp Configuration
// Replace the number below with your restaurant's WhatsApp number
// Format: Country code + phone number (without + or spaces)
// Example: For +1 234 567 8900, use '12345678900'

const WHATSAPP_CONFIG = {
    // Restaurant WhatsApp number (REQUIRED - Replace with your actual number)
    restaurantNumber: '8801903536179', // Your WhatsApp number: +880 1903 536179
    
    // Restaurant name (optional - used in messages)
    restaurantName: 'Taste Haven',
    
    // Message customization
    messageSettings: {
        includeTimestamp: true,
        includeEmojis: true,
        taxRate: 0.1 // 10% tax rate
    }
};

// Export for use in other files
window.WHATSAPP_CONFIG = WHATSAPP_CONFIG;
