const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

// Compromise generation endpoint
app.post("/api/compromise", async (req, res) => {
  try {
    console.log("[/api/compromise] Request received");
    const { topic, people } = req.body;

    if (!topic || !people || people.length === 0) {
      console.error("[/api/compromise] Missing topic or people");
      return res.status(400).json({ error: "Missing topic or people" });
    }

    console.log(`[/api/compromise] Processing ${people.length} people for topic: ${topic}`);

    const participantLines = people
      .map((p, i) => `${p.name.trim() || `Person ${i + 1}`}: "${p.preference.trim()}"`)
      .join("\n");

    const prompt = `You are a fair, witty mediator helping a group find a compromise.
Topic: ${topic.trim()}
Each person's preference:
${participantLines}
Your job:
1. Acknowledge each person's preference empathetically in one sentence each.
2. Identify the core values or needs behind each preference.
3. Suggest ONE creative, fair compromise that genuinely respects all parties.
4. Give the compromise a fun, memorable name.
5. Rate fairness from 1-10 with a brief reason.
Respond in this exact JSON format (no markdown, no backticks):
{
  "compromiseName": "...",
  "fairnessScore": 8,
  "fairnessReason": "...",
  "acknowledgements": ["person1 ack", "person2 ack"],
  "coreNeeds": ["person1 need", "person2 need"],
  "compromise": "Full compromise suggestion paragraph here.",
  "tagline": "A punchy one-liner tagline for the compromise"
}`;

    console.log("[/api/compromise] Calling Anthropic API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("[/api/compromise] Anthropic API error:", data);
      return res.status(500).json({ error: "Anthropic API failed", details: data });
    }

    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    if (!raw) {
      console.error("[/api/compromise] No text content in response");
      return res.status(500).json({ error: "Invalid response format from Anthropic" });
    }

    const clean = raw.replace(/```json|```/g, "").trim();
    
    try {
      const parsed = JSON.parse(clean);
      console.log("[/api/compromise] Success! Returning parsed response");
      res.json(parsed);
    } catch (parseError) {
      console.error("[/api/compromise] JSON parse error:", parseError.message);
      console.error("[/api/compromise] Raw response was:", raw);
      return res.status(500).json({ error: "Failed to parse response", raw: raw });
    }
  } catch (error) {
    console.error("[/api/compromise] Server error:", error.message);
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
});

// Chore splitting endpoint
app.post("/api/chores", async (req, res) => {
  try {
    console.log("[/api/chores] Request received");
    const { familyMembers, choreItems } = req.body;

    if (!familyMembers || familyMembers.length === 0) {
      console.error("[/api/chores] Missing family members");
      return res.status(400).json({ error: "Missing family members" });
    }

    console.log(`[/api/chores] Processing ${familyMembers.length} family members`);

    const memberDescriptions = familyMembers
      .map((m) => `- ${m.name}, age ${m.age}, available ${m.hoursPerWeek} hours/week, busy level: ${m.busyLevel}`)
      .join("\n");

    const choreList = choreItems && choreItems.length > 0 
      ? choreItems.join("\n- ")
      : "Vacuum, wash dishes, do laundry, mop floors, clean bathroom, take out trash";

    const choreListArray = choreItems && choreItems.length > 0 ? choreItems : [];

    const prompt = `You are a family chore coordinator. Your ONLY job is to assign these exact chores.

CRITICAL: You must assign ONLY these chores, and ONLY these chores:
${choreListArray.length > 0 ? choreListArray.map((c, i) => `${i + 1}. ${c}`).join('\n') : "1. Vacuum\n2. Wash dishes\n3. Laundry\n4. Mop floors\n5. Clean bathroom\n6. Take out trash"}

Family members:
${memberDescriptions}

Your ONLY task: Distribute the chores listed above among these family members.
- Each person gets 1-2 chores maximum
- Assign based on age and availability
- Do NOT create new chores
- Do NOT suggest additional chores
- Use the exact chore names from the list above

Respond ONLY with a JSON array, no markdown, no explanation, no other text:
[{ "name": "MemberName", "chores": ["chore from list", "another chore from list"] }]`;

    console.log("[/api/chores] Prompt:", prompt);
    console.log("[/api/chores] Calling Anthropic API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("[/api/chores] Anthropic API error:", data);
      return res.status(500).json({ error: "Anthropic API failed", details: data });
    }

    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    if (!raw) {
      console.error("[/api/chores] No text content in response");
      return res.status(500).json({ error: "Invalid response format from Anthropic" });
    }

    const clean = raw.replace(/```json|```/g, "").trim();
    
    try {
      let parsed = JSON.parse(clean);
      
      // Filter out any chores not in the input list (enforce strict compliance)
      if (choreListArray.length > 0) {
        const validChores = new Set(choreListArray.map(c => c.toLowerCase().trim()));
        parsed = parsed.map(person => ({
          name: person.name,
          chores: (person.chores || []).filter(chore => 
            validChores.has(chore.toLowerCase().trim())
          )
        })).filter(person => person.chores.length > 0); // Remove people with no chores
      }
      
      console.log("[/api/chores] Success! Returning parsed response");
      console.log("[/api/chores] Response:", JSON.stringify(parsed));
      res.json(parsed);
    } catch (parseError) {
      console.error("[/api/chores] JSON parse error:", parseError.message);
      console.error("[/api/chores] Raw response was:", raw);
      return res.status(500).json({ error: "Failed to parse response", raw: raw });
    }
  } catch (error) {
    console.error("[/api/chores] Server error:", error.message);
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
});

// Conflict analysis endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    console.log("[/api/analyze] Request received");
    const { conflictHistory } = req.body;

    if (!conflictHistory || conflictHistory.length === 0) {
      console.error("[/api/analyze] Missing conflict history");
      return res.status(400).json({ error: "Missing conflict history" });
    }

    console.log(`[/api/analyze] Processing ${conflictHistory.length} conflict records`);

    const prompt = `You are a family conflict analyst. Analyze these conflict records and find patterns.
Conflict history:
${JSON.stringify(conflictHistory, null, 2)}
Respond ONLY with a JSON array, no markdown, no explanation:
[{ "pattern": "Short description", "detail": "Longer explanation" }]`;

    console.log("[/api/analyze] Calling Anthropic API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("[/api/analyze] Anthropic API error:", data);
      return res.status(500).json({ error: "Anthropic API failed", details: data });
    }

    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    if (!raw) {
      console.error("[/api/analyze] No text content in response");
      return res.status(500).json({ error: "Invalid response format from Anthropic" });
    }

    const clean = raw.replace(/```json|```/g, "").trim();
    
    try {
      const parsed = JSON.parse(clean);
      console.log("[/api/analyze] Success! Returning parsed response");
      res.json(parsed);
    } catch (parseError) {
      console.error("[/api/analyze] JSON parse error:", parseError.message);
      console.error("[/api/analyze] Raw response was:", raw);
      return res.status(500).json({ error: "Failed to parse response", raw: raw });
    }
  } catch (error) {
    console.error("[/api/analyze] Server error:", error.message);
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
});

// Therapist chatbot endpoint
app.post("/api/therapist", async (req, res) => {
  try {
    console.log("[/api/therapist] Request received");
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      console.error("[/api/therapist] Missing message");
      return res.status(400).json({ error: "Missing message" });
    }

    console.log("[/api/therapist] Processing message from user");

    const systemPrompt = `You are a compassionate and empathetic AI therapist. Your role is to:
1. Listen carefully and validate the user's feelings
2. Ask thoughtful follow-up questions to understand their situation better
3. Offer supportive advice and coping strategies when appropriate
4. Encourage healthy communication and emotional expression
5. Be warm, non-judgmental, and genuinely caring

Remember: You are an AI support tool, not a replacement for professional therapy. For serious mental health concerns, gently encourage them to seek professional help.

Respond naturally and conversationally, keeping responses concise but meaningful (2-4 sentences typically).`;

    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    console.log("[/api/therapist] Calling Anthropic API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: messages,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("[/api/therapist] Anthropic API error:", data);
      return res.status(500).json({ error: "Anthropic API failed", details: data });
    }

    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    if (!raw) {
      console.error("[/api/therapist] No text content in response");
      return res.status(500).json({ error: "Invalid response format from Anthropic" });
    }

    console.log("[/api/therapist] Success! Returning response");
    res.json({ response: raw });
  } catch (error) {
    console.error("[/api/therapist] Server error:", error.message);
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
