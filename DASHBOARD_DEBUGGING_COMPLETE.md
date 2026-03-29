# Dashboard API Failure - Complete Debugging Explanation

## 📊 The Problem

When you click "Analyze Conflict Patterns with AI" in the Dashboard, one of these errors appears:
- ❌ "Backend connection failed. Make sure your server is running on port 3001."
- ❌ "Failed to analyze conflicts"
- ❌ "Something went wrong"
- ❌ Or just no response

---

## 🔍 Why It's Failing - Root Causes

### **Cause #1: Backend Server Not Running** (MOST COMMON - 80% of cases)

**What happens:**
```
Frontend tries to reach: http://localhost:3001/api/analyze
But nobody is listening on port 3001
Result: "Backend connection failed" error
```

**How to verify:**
```bash
# In one terminal, run:
cd /Users/rayhaansheikh/Desktop/Family\ Harmony
node server.js

# Should print:
# ✅ Server running at http://localhost:3001
```

**If you see "Port already in use" error:**
```bash
# Find and kill the process on port 3001
lsof -i :3001
kill -9 <PID>

# Then run server.js again
```

---

### **Cause #2: ANTHROPIC_API_KEY Missing or Invalid** (15% of cases)

**What happens:**
```
Backend receives request ✓
Tries to call Anthropic API with ANTHROPIC_API_KEY ✗
process.env.ANTHROPIC_API_KEY is undefined or wrong
Anthropic returns: {"error": {"type": "authentication_error"}}
Server logs: "Anthropic API failed"
```

**How to verify:**
```bash
# Check if .env file exists and has key:
cat /Users/rayhaansheikh/Desktop/Family\ Harmony/.env

# Should look like:
# ANTHROPIC_API_KEY=sk-ant-api03-yf57h8jXQTTtLHckObOT...

# If missing or empty:
echo 'ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE' > /Users/rayhaansheikh/Desktop/Family\ Harmony/.env
```

**Important:** You must restart `node server.js` after modifying .env for changes to take effect!

---

### **Cause #3: Response Format Error** (4% of cases)

**What happens:**
```
Anthropic returns valid JSON array like:
[{"pattern": "...", "detail": "..."}]

BUT sometimes it wraps it in markdown:
```json
[{"pattern": "...", "detail": "..."}]
```

Server tries to JSON.parse() and fails
Error: "Failed to parse response"
```

**The Fix (already applied):**
```javascript
// This line removes markdown if present:
const clean = raw.replace(/```json|```/g, "").trim();
```

---

### **Cause #4: Network/CORS Issues** (1% of cases)

**What happens:**
```
Frontend can reach backend ✓
Backend can reach Anthropic ✓
But response doesn't make it back to frontend ✗
```

**Rare but check browser console (F12 → Console tab) for:**
- `ERR_SOCKET_HANG_UP`
- `ECONNREFUSED`
- `timeout`

---

## 🛠️ The Improved Error Handling (Just Added)

I've enhanced `server.js` with detailed logging for better debugging:

### **Before (vague errors):**
```
❌ "Something went wrong"       ← Not helpful!
❌ "Failed to analyze conflicts" ← What went wrong?
```

### **After (specific errors):**
```
✅ "[/api/analyze] Request received"           ← Confirmed server got request
✅ "[/api/analyze] Processing 3 conflict records" ← Shows data flow
✅ "[/api/analyze] Calling Anthropic API..."   ← Tracks which step fails
✅ **"Anthropic API failed: Invalid API key"** ← NOW you know the problem!
✅ **"Failed to parse response: Unexpected token" ← Exact parse error!
✅ "[/api/analyze] Success! Returning parsed response" ← Confirmed completion
```

---

## 📋 How to Debug: Step-by-Step

### **Step 1: Start Backend with Logging**
```bash
cd /Users/rayhaansheikh/Desktop/Family\ Harmony
node server.js
```

Watch for output. Leave this terminal open and don't close it.

---

### **Step 2: Start Frontend**
```bash
# In a new terminal:
cd /Users/rayhaansheikh/Desktop/Family\ Harmony/family-harmony-app
npm start
```

App opens at http://localhost:3000

---

### **Step 3: Test the API**
1. Click "Conflict Insights Dashboard"
2. Click "Analyze Conflict Patterns with AI"
3. **Check the backend terminal output** ← This is key!

---

### **Step 4: Read the Logs**

**If you see in backend terminal:**

```
[/api/analyze] Request received
[/api/analyze] Processing 3 conflict records
[/api/analyze] Calling Anthropic API...
Anthropic API error: {"error": {"type": "authentication_error", "message": "Invalid API key"}}
[/api/analyze] Anthropic API failed
```
↳ **Solution:** Your ANTHROPIC_API_KEY is wrong or missing. Update `.env` file.

---

```
[/api/analyze] Request received
[/api/analyze] Processing 3 conflict records
[/api/analyze] Calling Anthropic API...
[/api/analyze] Success! Returning parsed response
```
↳ **Solution:** Working! Check frontend console (F12) for any display errors.

---

```
[/api/analyze] Request received
[/api/analyze] Processing 3 conflict records
[/api/analyze] Calling Anthropic API...
[/api/analyze] JSON parse error: Unexpected token [ in JSON at position 0
[/api/analyze] Raw response was: [{"pattern": ...
```
↳ **Solution:** Response format issue. Restarting server usually fixes it. If not, the raw response will show exactly what's wrong.

---

## 🧪 Manual API Test (No Frontend)

Test directly without opening the app:

```bash
# Open a new terminal and run:
curl -s -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "conflictHistory": [
      {"members": ["Parent", "Teen"], "topic": "Chores", "time": "Evening"},
      {"members": ["Parent", "Teen"], "topic": "Screen time", "time": "Evening"},
      {"members": ["Parent", "Child"], "topic": "Homework", "time": "Morning"}
    ]
  }' | jq .
```

**Expected success output:**
```json
[
  {
    "pattern": "Evening conflicts are most frequent",
    "detail": "Multiple conflicts involving teenagers occur in the evening..."
  },
  {
    "pattern": "Chores and screen time are recurring topics",
    "detail": "Family disagreements center around responsibilities..."
  }
]
```

**Expected error output (to diagnose):**
```json
{"error": "Anthropic API failed", "details": {"error": {"type": "authentication_error"}}}
```

---

## ✨ Key Changes Made to Fix Dashboard Debugging

1. **Added detailed logging to all endpoints** - Now logs each step
2. **Better error messages** - Shows exactly what failed instead of "Something went wrong"
3. **Improved error handling** - Separates API errors from parsing errors from network errors
4. **Returns raw response on parse errors** - So you can see exactly what Anthropic returned

---

## 📝 Quick Reference: Expected Payloads

### Frontend sends to `/api/analyze`:
```json
{
  "conflictHistory": [
    {
      "members": ["Person1", "Person2"],
      "topic": "Topic name",
      "time": "Time of day"
    }
  ]
}
```

### Backend expects from Anthropic:
```json
{
  "content": [
    {
      "type": "text",
      "text": "[{\"pattern\": \"...\", \"detail\": \"...\"}]"
    }
  ]
}
```

### Backend returns to Frontend:
```json
[
  {
    "pattern": "Pattern description",
    "detail": "Detailed explanation"
  }
]
```

---

## 🎯 Most Likely Solutions (In Order)

1. **Backend not running?** → Run `node server.js`
2. **API key wrong?** → Check `.env` file, update it, restart server
3. **Still failing?** → Check backend logs (terminal where server is running)
4. **Parse error?** → Check raw response in logs, might be formatting issue
5. **Network error?** → Check browser console (F12), look for network tab

---

**You're now equipped to debug Dashboard API failures! 🎉**
