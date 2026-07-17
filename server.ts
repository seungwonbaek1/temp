import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// IPS specialized terms for the prompt
const IPS_SYSTEM_INSTRUCTION = `
You are an IPS (Integrated Product Support) meeting assistant for Hanwha Aerospace.
Your goal is to extract structured information from meeting transcripts.
IPS specific terms to recognize: PGM, RAM-C, FMECA, LSA, OPUS, Windchill, BOM, FMECA, RAM, PBL, LORA.

Extract the following:
1. Participants: List of people mentioned.
2. Decisions: Key technical or administrative conclusions made during the meeting.
3. Action Items: Specific tasks, assignees (if mentioned), and due dates (if mentioned).
4. Summary: A concise 3-4 sentence summary of the meeting.

Return the data in the following JSON format:
{
  "participants": ["string"],
  "decisions": ["string"],
  "actionItems": [
    { "task": "string", "assignee": "string", "dueDate": "string" }
  ],
  "summary": "string"
}

If any information is missing, provide reasonable defaults or empty strings/arrays.
`;

app.post("/api/analyze", async (req, res) => {
  try {
    const { transcript, contextFiles } = req.body;

    const prompt = `
      Meeting Transcript:
      ${transcript}

      ${contextFiles ? `Context from uploaded files (BOM/RAM analysis): ${contextFiles}` : ""}
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: IPS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            participants: { type: Type.ARRAY, items: { type: Type.STRING } },
            decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  assignee: { type: Type.STRING },
                  dueDate: { type: Type.STRING }
                },
                required: ["task", "assignee", "dueDate"]
              }
            },
            summary: { type: Type.STRING }
          },
          required: ["participants", "decisions", "actionItems", "summary"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to analyze meeting transcript" });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

setupServer();
