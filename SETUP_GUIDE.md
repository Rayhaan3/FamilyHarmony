# Family Harmony App - Setup & Running Guide

## 🔧 Complete Fixes Applied

### 1. **Fixed Missing Dependencies**
- ✅ Added `lucide-react` to package.json
- ✅ Installed with `npm install lucide-react`

### 2. **Fixed UI Layout Issues**  
- ✅ Updated HomePage.css to use CSS Grid for responsive tile display
- ✅ All 3 feature tiles now display properly and are clickable

### 3. **Fixed Navigation**
- ✅ Added "Back to Home" buttons to all component pages
- ✅ Proper navigation routing with react-router-dom

### 4. **Fixed Code Quality Issues**
- ✅ Removed unused state variables from App.js
- ✅ Removed unused prompt variable from CompromiseGenerator.js
- ✅ Cleaned up API headers

### 5. **Fixed Backend Architecture** (CRITICAL)
- ✅ Updated server.js with 3 API endpoints:
  - `/api/compromise` - Compromise generation
  - `/api/chores` - Chore splitting
  - `/api/analyze` - Conflict analysis
- ✅ All API calls now go through backend (localhost:3001)
- ✅ Backend handles Anthropic API calls securely

---

## 🚀 How to Run the Application

### Step 1: Install Dependencies
```bash
cd family-harmony-app
npm install
```

### Step 2: Ensure .env Files are Set
Make sure both `.env` files have the ANTHROPIC_API_KEY:
- `/vsls/` .env (for backend)
- `/vsls/family-harmony-app/.env` (for frontend)

### Step 3: Start Backend Server (Terminal 1)
```bash
cd /vsls/
node server.js
```
Expected output: ✅ Proxy server running at http://localhost:3001

### Step 4: Start React Frontend (Terminal 2)
```bash
cd /vsls/family-harmony-app
npm start
```
Expected output: App runs on http://localhost:3000

---

## 📱 Using the App

### Home Page
- 3 colored tiles appear:
  1. **Compromise Generator** - Create fair compromises
  2. **Smart Chore Splitter** - Distribute chores fairly
  3. **Conflict Insights Dashboard** - Analyze family patterns

### Compromise Generator
1. Enter topic (e.g. "Where to eat dinner")
2. Add 2-5 people with their preferences
3. Click "Generate Compromise"
4. View AI-generated fair solution
5. Click "Back to Home" to return

### Smart Chore Splitter
1. Add family members with name/age/availability hours
2. List chores to distribute
3. Click "Optimize Distribution"
4. View chore assignments
5. Click "Back to Home" to return

### Conflict Insights Dashboard
1. Click "Analyze Conflict Patterns with AI"
2. View AI insights on family conflicts
3. Click "Back to Home" to return

---

## ✅ Verification Checklist

- [ ] Dependencies installed: `npm install lucide-react`
- [ ] Backend .env has ANTHROPIC_API_KEY
- [ ] Frontend .env has REACT_APP_ANTHROPIC_API_KEY
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Can see 3 tiles on home page
- [ ] Can click between pages
- [ ] Can see "Back to Home" buttons
- [ ] APIs respond properly when used

---

## 🐛 Troubleshooting

### "Backend connection failed" Error
- Check that `node server.js` is running on port 3001
- Verify ANTHROPIC_API_KEY is in `/vsls/.env`

### "Cannot find tiles" 
- Clear browser cache (Ctrl+Shift+Del)
- Refresh the page (Ctrl+R)
- Check that HomePage.css was updated correctly

### Navigation not working
- Ensure react-router-dom is in package.json (should be v7.13.2)
- Check browser console for errors (F12)

### API Key not working
- Verify API key format (should start with `sk-ant-`)
- Check that key is in BOTH .env files
- Try regenerating key from Anthropic dashboard

---

## 📝 Files Modified

- ✅ `family-harmony-app/package.json` - Added lucide-react
- ✅ `family-harmony-app/src/App.js` - Updated to use backend APIs
- ✅ `family-harmony-app/src/components/Homepage.js` - Navigation perfect
- ✅ `family-harmony-app/src/components/CompromiseGenerator.js` - Clean code
- ✅ `family-harmony-app/src/components/ChoreSplitter.js` - Added goBack
- ✅ `family-harmony-app/src/components/HomePage.css` - Responsive grid
- ✅ `server.js` - Added /api/chores and /api/analyze endpoints

---

All issues should now be resolved! 🎉
