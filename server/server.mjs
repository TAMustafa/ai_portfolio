import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { buildKnowledgeIndex } from "./knowledgeIndexer.mjs";

// Always load env from server/.env so it works whether you run from root or server dir
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

let knowledgeIndex = buildKnowledgeIndex();

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s#\-_/]/g, " ")
    .split(/\s+/)
    .filter(
      (t) =>
        t &&
        t.length >= 2 &&
        !["the", "and", "or", "about", "tell", "me", "you", "are", "what", "do"].includes(t),
    );
}

function scoreDoc(query, doc) {
  // --- DEBUG LOGGING ---
  // console.log(`Scoring doc: "${doc.title}" for query: "${query}"`);
  const tokens = tokenize(query);
  if (!tokens.length) return 0;
  const title = (doc.title || "").toLowerCase();
  const subtitle = (doc.subtitle || "").toLowerCase();
  const tags = (doc.tags || []).map((t) => t.toLowerCase());
  const body = (doc.text || "").toLowerCase();

  let score = 0;
  for (const tok of tokens) {
    if (title.includes(tok)) score += 6;
    if (subtitle.includes(tok)) score += 3;
    if (tags.some((t) => t.includes(tok))) score += 4;
    const bodyHits = (
      body.match(new RegExp(tok.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g")) || []
    ).length;
    score += Math.min(bodyHits, 3);
  }
  // --- DEBUG LOGGING ---
  // if (score > 0) console.log(`  -> Score: ${score}`);
  return score;
}

function retrieveTopSnippets(query, lang, k = 3) {
  // --- DEBUG LOGGING ---
  console.log(`\n[DEBUG] Retrieving snippets for query: "${query}", lang: "${lang}"`);
  console.log(`  -> Searching in ${knowledgeIndex.length} total documents.`);
  const docs = knowledgeIndex.filter((d) => !lang || d.lang === lang);
  const ranked = docs
    .map((d) => ({ d, s: scoreDoc(query, d) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .filter((x) => x.s > 0)
    .map(({ d, s }) => ({
      title: d.title,
      slug: d.slug,
      lang: d.lang,
      tags: d.tags,
      excerpt: d.text.slice(0, 800),
      score: s,
    }));
  // --- DEBUG LOGGING ---
  console.log(`  -> Found ${ranked.length} relevant snippets.`);
  if (ranked.length > 0)
    console.log("  -> Top snippet:", ranked[0].title, `(Score: ${ranked[0].score})`);
  console.log(`--------------------`);
  return ranked;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, indexed: knowledgeIndex.length });
});

app.post("/api/reindex", (_req, res) => {
  try {
    knowledgeIndex = buildKnowledgeIndex();
    res.json({ ok: true, indexed: knowledgeIndex.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post("/api/chat", async (req, res) => {
  const { messages, lang } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query = lastUser?.content ?? "";

  const snippets = retrieveTopSnippets(query, lang, 4);
  const knowledgeBlock = snippets
    .map(
      (s, i) =>
        `(#${i + 1}) [${s.lang}] ${s.title} (/${s.lang}/project/${s.slug})\nTags: ${s.tags.join(", ")}\nExcerpt: ${s.excerpt}`,
    )
    .join("\n\n");

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    // Provide graceful degradation so frontend can fallback
    return res.status(501).json({ error: "OPENAI_API_KEY not configured", snippets });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const systemPrompt = [
      "You are a helpful portfolio assistant for a personal website.",
      "Answer questions about the developer's experience and projects.",
      "Rely primarily on the provided knowledge snippets; if something is unknown, say you are not sure and suggest contacting.",
      "Keep answers concise and helpful. Include links as /{lang}/project/{slug} when referencing projects.",
      `Current language: ${lang || "en"}. If user writes in Dutch (nl) reply in Dutch; otherwise reply in English.`,
    ].join(" ");

    const toolsContext = knowledgeBlock
      ? `Knowledge snippets (top matches):\n\n${knowledgeBlock}\n\n`
      : "No matching knowledge snippets found.\n\n";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: toolsContext },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.4,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Optionally send snippets at the end
    res.write(`data: ${JSON.stringify({ snippets })}\n\n`);
    res.end();
  } catch (e) {
    console.error("Chat error", e);
    res.status(500).json({ error: "chat_failed", details: String(e) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] indexed ${knowledgeIndex.length} documents`);
});
