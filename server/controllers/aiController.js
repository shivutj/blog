import "dotenv/config";
import sql from "../configs/db.js";
import { createOpenRouterCompletion } from "../services/openrouter.js";

export const generateArticle = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    console.log(`[AI Controller] User ${userId} requesting article generation`);
    console.log(`[AI Controller] Prompt: ${prompt.substring(0, 100)}...`);

    // Check usage limits
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Generate article using OpenRouter
    const data = await createOpenRouterCompletion(
      [{ role: "user", content: prompt }],
      {
        model: "openai/gpt-4o-mini",
        max_tokens: length || 1000,
        temperature: 0.7,
      }
    );

    const content = data.choices[0].message.content;

    // Save to database
    await sql` INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    console.log(`[AI Controller] Article generated successfully`);
    res.json({ success: true, content });
  } catch (error) {
    console.error("[AI Controller] Article generation failed:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    console.log(`[AI Controller] User ${userId} requesting blog title`);
    console.log(`[AI Controller] Prompt: ${prompt}`);

    // Check usage limits
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // Generate blog title using OpenRouter
    const data = await createOpenRouterCompletion(
      [{ role: "user", content: prompt }],
      {
        model: "openai/gpt-4o-mini",
        max_tokens: 200,
        temperature: 0.8,
      }
    );

    const content = data.choices[0].message.content;

    // Save to database
    await sql` INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    console.log(`[AI Controller] Blog title generated successfully`);
    res.json({ success: true, content });
  } catch (error) {
    console.error(
      "[AI Controller] Blog title generation failed:",
      error.message
    );
    res.json({ success: false, message: error.message });
  }
};
