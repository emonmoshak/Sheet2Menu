# 🚀 Google Sheets CMS Integration - Complete Setup Guide

This guide will help you connect your restaurant menu website to Google Sheets, allowing you to manage your entire menu through a simple spreadsheet.

## 📋 What You'll Achieve

After following this guide, you'll be able to:
- ✅ Edit menu items directly in Google Sheets
- ✅ Change food images by pasting image URLs
- ✅ Update prices, descriptions, and stock status instantly
- ✅ Add/remove categories and menu items
- ✅ Configure restaurant settings
- ✅ Have your website automatically update every 5 minutes

---

## 🔧 Step 1: Create Your Google Sheet

### 1.1 Create a New Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Create" → "Blank spreadsheet"
3. Name your sheet: `Restaurant Menu CMS`

### 1.2 Create Three Sheets (Tabs)
Create these three sheets in your Google Sheets document:

#### Sheet 1: "Items" 
Create columns with these **exact** headers:
```
Name | Description | Price | Category | Image | Stock
```

**Example data:**
```
Margherita Pizza | Classic pizza with fresh mozzarella and basil | 15.50 | main-dishes | https://example.com/pizza.jpg | in
Crispy Calamari | Tender calamari, lightly battered and fried | 12.99 | starters | https://example.com/calamari.jpg | in
Tiramisu | A coffee-flavored Italian dessert | 8.50 | desserts | https://example.com/tiramisu.jpg | out
Fresh Lemonade | House-made lemonade, sweet and tangy | 4.50 | drinks | https://example.com/lemonade.jpg | low
```

**Important Notes:**
- **Category values:** Use `starters`, `main-dishes`, `desserts`, `drinks`, `specials`
- **Stock values:** Use `in`, `low`, `out`
- **Image:** Use direct image URLs (we'll show you how to get these)

#### Sheet 2: "Categories"
Create columns with these **exact** headers:
```
Name | Background
```

**Example data:**
```
Starters | https://example.com/starters-bg.jpg
Main Dishes | https://example.com/main-bg.jpg
Desserts | https://example.com/desserts-bg.jpg
Drinks | https://example.com/drinks-bg.jpg
Specials | https://example.com/specials-bg.jpg
```

#### Sheet 3: "Config"
Create columns with these **exact** headers:
```
Key | Value
```

**Example data:**
```
restaurant_name | Your Restaurant Name
contact_number | +1234567890
delivery | Yes
whatsapp_number | +1234567890
currency | $
tax_rate | 0.1
```

---

## 🔑 Step 2: Get Google Sheets API Key

### 2.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 2.2 Create a New Project
1. Click "Select a project" → "New Project"
2. Name it: `Restaurant Menu API`
3. Click "Create"

### 2.3 Enable Google Sheets API
1. Go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 2.4 Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key (you'll need this later)
4. Click "Restrict Key" for security
5. Under "API restrictions", select "Google Sheets API"
6. Click "Save"

---

## 🌐 Step 3: Make Your Sheet Public

### 3.1 Share Your Google Sheet
1. Open your Google Sheet
2. Click "Share" (top-right corner)
3. Click "Change to anyone with the link"
4. Set permission to "Viewer"
5. Click "Copy link"

### 3.2 Get Your Spreadsheet ID
From the copied link, extract the Spreadsheet ID:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit#gid=0
```
Copy the `SPREADSHEET_ID_HERE` part.

---

## ⚙️ Step 4: Configure Your Website

### 4.1 Update Configuration File
Open `js/config.js` in your website files and update:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        API_KEY: 'YOUR_API_KEY_HERE',           // Paste your API key
        SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID', // Paste your spreadsheet ID
        ENABLED: true                          // Change to true
    },
    // ... rest of config
};
```

### 4.2 Test Your Setup
1. Open your website
2. Check the browser console (F12 → Console)
3. Look for messages like:
   - ✅ "Data loaded from Google Sheets: {items: X, categories: Y}"
   - ❌ "Error loading data from Google Sheets"

---

## 🖼️ Step 5: Adding Images (Easy Method)

### Method 1: Using Google Drive (Recommended)
1. Upload images to Google Drive
2. Right-click image → "Get link"
3. Change sharing to "Anyone with the link can view"
4. Copy the link and modify it:

**Original:** `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
**Modified:** `https://drive.google.com/uc?id=FILE_ID`

### Method 2: Using Free Image Hosting
- [Imgur](https://imgur.com) - Upload and get direct links
- [Cloudinary](https://cloudinary.com) - Professional image hosting
- [ImageBB](https://imgbb.com) - Simple and free

### Method 3: Using Your Website's Assets Folder
Place images in `/assets/images/food/` and reference them as:
```
/assets/images/food/pizza.jpg
```

---

## 🧪 Step 6: Testing Your Menu

### 6.1 Add Test Data
Add a few items to your Google Sheet:

```
Name: Test Pizza
Description: This is a test item
Price: 10.99
Category: main-dishes
Image: https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Test+Pizza
Stock: in
```

### 6.2 Check Website Updates
1. Save your Google Sheet
2. Wait 30 seconds (for API caching)
3. Refresh your website
4. Your new item should appear!

---

## 🔄 Step 7: Managing Your Menu

### Adding New Items
1. Open your Google Sheet
2. Add a new row in the "Items" sheet
3. Fill in all columns
4. Save the sheet
5. Website updates automatically within 5 minutes

### Updating Prices
1. Find the item in your "Items" sheet
2. Change the price
3. Save - website updates automatically

### Managing Stock
- `in` - Item is available
- `low` - Low stock warning
- `out` - Item is out of stock (grayed out)

### Adding Categories
1. Add new category in "Categories" sheet
2. Use the category name in "Items" sheet
3. Make sure category names match exactly

---

## 🚨 Troubleshooting

### Common Issues:

#### "Failed to load from Google Sheets"
- ✅ Check API key is correct
- ✅ Verify spreadsheet ID
- ✅ Ensure sheet is public
- ✅ Check sheet names are exactly: "Items", "Categories", "Config"

#### Images Not Loading
- ✅ Use direct image URLs
- ✅ Test image URL in browser first
- ✅ Ensure images are publicly accessible

#### Items Not Updating
- ✅ Check column headers match exactly
- ✅ Verify data format (prices as numbers, categories as text)
- ✅ Wait up to 5 minutes for auto-refresh

#### API Quota Exceeded
- ✅ Google Sheets API has daily limits
- ✅ Consider upgrading to paid plan for high-traffic sites

---

## 🎯 Pro Tips

### 1. Image Optimization
- Use images around 300x200px for best performance
- Compress images before uploading
- Use WebP format when possible

### 2. Data Management
- Keep a backup copy of your sheet
- Use data validation in Google Sheets
- Set up notifications for sheet changes

### 3. Performance
- The website caches data for 5 minutes
- Manual refresh available in browser console: `location.reload()`
- Consider CDN for images in production

### 4. Security
- Restrict API key to your domain in production
- Never share your API key publicly
- Use environment variables for sensitive data

---

## 📱 Mobile Management

You can manage your menu from anywhere:
1. Install Google Sheets mobile app
2. Edit your menu on the go
3. Changes reflect on website automatically
4. Perfect for updating daily specials or stock status

---

## 🆘 Need Help?

### Debug Mode
Enable debug mode in `js/config.js`:
```javascript
APP: {
    DEBUG: true
}
```

### Console Commands
Open browser console (F12) and try:
```javascript
// Force refresh data
state.sheetsAPI.clearCache();
location.reload();

// Check current data
console.log('Menu Items:', state.menuItems);
console.log('Categories:', state.categories);
```

### Common Error Messages
- `API key not valid` - Check your API key
- `Spreadsheet not found` - Check spreadsheet ID and sharing settings
- `Sheet not found` - Verify sheet names are correct

---

## 🎉 You're All Set!

Your restaurant menu is now powered by Google Sheets! You can:
- ✅ Update menu items instantly
- ✅ Change prices on the fly
- ✅ Add seasonal specials
- ✅ Manage stock status
- ✅ Update from anywhere with internet

**Remember:** Changes take up to 5 minutes to appear on the website due to caching.

---

## 📞 Support

If you need help with setup:
1. Check the browser console for error messages
2. Verify all steps in this guide
3. Test with simple data first
4. Ensure all permissions are set correctly

Happy menu management! 🍕🎉
