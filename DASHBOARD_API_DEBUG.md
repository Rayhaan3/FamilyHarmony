# Dashboard API Debugging Guide

## 🔍 API Call Flow Diagram

```
Dashboard.js (User clicks "Analyze")
    ↓
Calls: onAnalyze(sampleHistory)
    ↓
App.js: analyzeConflicts(conflictHistory) 
    ↓
Sends: POST http://localhost:3001/api/analyze
Body: { conflictHistory: [...] }
    ↓
server.js: /api/analyze endpoint
    ↓
Sends: POST https://api.anthropic.com/v1/messages
With: ANTHROPIC_API_KEY from .env
    ↓
Parses JSON response
    ↓
Returns data to frontend
```

---

## ❌ Common Failure Points (in order of likelihood):

### **1. Backend Server Not Running** - MOST LIKELY ⚠️
```
Issue: Server isn't listening on port 3001
Result: "Backend connection failed" error appears
Fix: In terminal, run:
cd /Users/rayhaansheikh/Desktop/Family\ Harmony
node server.js
```
**Verify:** Should see: `✅ Server running at http://localhost:3001`

---

### **2. ANTHROPIC_API_KEY Not Set** - VERY LIKELY ⚠️
```
Problem: server.js tries to use process.env.ANTHROPIC_API_KEY
Result: Backend receives undefined API key
Symptom: Returns "Failed to analyze conflicts" instead of parsing error
```

**Check file:** `/Users/rayhaansheikh/Desktop/Family\ Harmony/.env`
```
ANTHROPIC_API_KEY=sk-ant-api03-yf57h8jXQTTtLHckObOTpZdusPYRIvs...
```

**If missing, add it:**
```bash
# Terminal
echo 'ANTHROPIC_API_KEY=sk-ant-...' > /Users/rayhaansheikh/Desktop/Family\ Harmony/.env
```

---

### **3. CORS or Network Issues** - POSSIBLE 📡
```
Issue: Frontend can't reach backend
Result: Network error in browser console
```

**Check in browser console (F12 → Console tab):**
- Look for: `ERR_CONNECTION_REFUSED`
- Or: `Failed to fetch`

**Fix:**
- Make sure backend is running on port 3001
- Check firewall isn't blocking localhost:3001
- Restart both backend and frontend

---

### **4. API Response Format Issue** - LIKELY FOR ERRORS 🎯

**The Problem:**
```javascript
// This line tries to parse JSON:
const parsed = JSON.parse(clean);
```

**What happens if Anthropic returns error:**
```
Anthropic returns:
{
  "error": {
    "type": "invalid_request_error",
    "message": "Invalid API key"
  }
}

NOT an array like: [{ "pattern": "...", "detail": "..." }]

Result: JSON.parse() throws error
Caught by try-catch: "Something went wrong"
```

---

## 🔧 Step-by-Step Debugging

### **Step 1: Check Backend is Running**
```bash
# In one terminal window:
cd /Users/rayhaansheikh/Desktop/Family\ Harmony
node server.js
# Should print: ✅ Server running at http://localhost:3001
```

### **Step 2: Check API Key Exists**
```bash
# In another terminal:
cat /Users/rayhaansheikh/Desktop/Family\ Harmony/.env
# Should print: ANTHROPIC_API_KEY=sk-ant-...
```

### **Step 3: Test API Directly**
```bash
# Test the endpoint:
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "conflictHistory": [
      {"members": ["Parent", "Teen"], "topic": "Chores", "time": "Evening"},
      {"members": ["Parent", "Teen"], "topic": "Screen time", "time": "Evening"}
    ]
  }' 2>&1
```

**Expected Success Response:**
```json
[
  {
    "pattern": "Chores are a recurring topic",
    "detail": "Multiple conflicts involve household responsibilities..."
  }
]
```

**Expected Error Response (to diagnose):**
```json
{"error": "Invalid API key"}
{"error": "Something went wrong"}
{"error": "Missing conflict history"}
```

### **Step 4: Check Browser Console**
1. Open app: http://localhost:3000
2. Click Dashboard → "Analyze Conflict Patterns with AI"
3. Open DevTools (F12 or Cmd+Option+I on Mac)
4. Go to **Console** tab
5. Look for error messages like:
   - `ERR_CONNECTION_REFUSED` → Backend not running
   - `Backend connection failed. Make sure your server is running on port 3001.` → Frontend couldn't reach backend
   - Any JSON parse errors

---

## 🚨 Error Messages Explained

| Error | Cause | Solution |
|-------|-------|----------|
| "Backend connection failed" | Server not running | Run `node server.js` |
| "Something went wrong" | API key invalid or JSON parse error | Check ANTHROPIC_API_KEY |
| "Missing conflict history" | Payload format wrong | Should not happen - check App.js |
| Blank response or timeout | Backend hanging | Check Anthropic API status |

---

## 📋 Complete Fix Checklist

- [ ] Backend running: `node server.js` in correct directory
- [ ] ANTHROPIC_API_KEY set in `/Users/rayhaansheikh/Desktop/Family\ Harmony/.env`
- [ ] Frontend running: `npm start` in family-harmony-app
- [ ] Can reach http://localhost:3000
- [ ] Browser console shows no errors
- [ ] Test API with curl command above
- [ ] Click "Analyze" button and check for response

---

## 🎯 Most Likely Fix (90% of cases)

**The backend server is not running!**

```bash
# Start in Terminal 1:
cd /Users/rayhaansheikh/Desktop/Family\ Harmony
node server.js

# Start in Terminal 2:
cd /Users/rayhaansheikh/Desktop/Family\ Harmony/family-harmony-app
npm start
```

Once both are running, Dashboard API should work perfectly! ✅
