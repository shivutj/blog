import "dotenv/config";

/**
 * OpenRouter API Service
 * Following the pattern from OpenRouter documentation
 */

/**
 * Create a completion using OpenRouter API
 * @param {Array} messages - Array of message objects {role, content}
 * @param {Object} options - Configuration options
 * @returns {Object} Response data from OpenRouter
 */
export async function createOpenRouterCompletion(messages, options = {}) {
  const {
    model = "openai/gpt-4o-mini",
    temperature = 0.7,
    max_tokens = null,
  } = options;

  const siteUrl = process.env.SITE_URL || "http://localhost:5173";
  const siteName = process.env.SITE_NAME || "QuickAI";

  console.log(`[OpenRouter] Calling model: ${model}`);
  console.log(`[OpenRouter] Messages count: ${messages.length}`);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": siteName,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens,
          stream: false,
        }),
      }
    );

    const data = await response.json();

    // Handle rate limiting (429)
    if (response.status === 429) {
      console.log("[OpenRouter] Rate limited, waiting 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Retry once
      const retryResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": siteUrl,
            "X-Title": siteName,
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: max_tokens,
            stream: false,
          }),
        }
      );

      const retryData = await retryResponse.json();

      if (retryData.error) {
        throw new Error(
          retryData.error.message || "API request failed after retry"
        );
      }

      return retryData;
    }

    // Handle authentication errors (401)
    if (response.status === 401) {
      throw new Error(
        "Invalid OpenRouter API key. Please check your .env file and ensure OPENROUTER_API_KEY is set correctly."
      );
    }

    // Handle model not found (404)
    if (response.status === 404) {
      throw new Error(
        `Model '${model}' not found. Please check the model name and try again.`
      );
    }

    // Handle server errors (500+)
    if (response.status >= 500) {
      throw new Error(
        "OpenRouter service is temporarily unavailable. Please try again later."
      );
    }

    // Check for errors in response body
    if (data.error) {
      console.error("[OpenRouter] Error:", data.error);
      throw new Error(data.error.message || "API request failed");
    }

    console.log("[OpenRouter] Success! Token usage:", data.usage);
    return data;
  } catch (error) {
    console.error("[OpenRouter] Request failed:", error.message);
    throw error;
  }
}

/**
 * Generate a blog title using OpenRouter
 * @param {string} prompt - The prompt for generating titles
 * @returns {string} Generated titles
 */
export async function generateBlogTitle(prompt) {
  const messages = [
    {
      role: "user",
      content: `Generate creative and engaging blog titles for: ${prompt}. Provide exactly 5 titles, one per line.`,
    },
  ];

  const data = await createOpenRouterCompletion(messages, {
    model: "openai/gpt-4o-mini",
    max_tokens: 200,
    temperature: 0.8,
  });

  return data.choices[0].message.content;
}

/**
 * Generate an article using OpenRouter
 * @param {string} prompt - The prompt for generating the article
 * @param {number} length - Desired length in words
 * @returns {string} Generated article content
 */
export async function generateArticle(prompt, length = 1000) {
  const messages = [
    {
      role: "user",
      content: `Write a comprehensive article about: ${prompt}. The article should be around ${length} words, well-structured with headings, and engaging for readers.`,
    },
  ];

  const data = await createOpenRouterCompletion(messages, {
    model: "openai/gpt-4o-mini",
    max_tokens: length * 2, // Allow extra tokens for response
    temperature: 0.7,
  });

  return data.choices[0].message.content;
}
