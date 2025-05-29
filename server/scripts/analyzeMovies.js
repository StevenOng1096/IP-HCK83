const { Movie } = require("../models");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeMoviesWithAI() {
  try {
    // Get movies without AI analysis
    const movies = await Movie.findAll({
      where: {
        ai_analysis: {},
      },
      limit: 50, // Process in batches
    });

    console.log(`🤖 Analyzing ${movies.length} movies with AI...`);

    for (const movie of movies) {
      try {
        const prompt = `Analyze this movie for recommendation purposes:
        
Title: ${movie.title}
Overview: ${movie.overview}

Provide a JSON response with:
- themes: array of main themes
- mood: overall mood (light/dark/neutral)
- target_audience: who would enjoy this
- complexity: simple/medium/complex
- emotional_impact: low/medium/high
- recommendation_reasons: array of why someone might like this
- similar_vibes: array of descriptive tags`;

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });

        const aiAnalysis = JSON.parse(response.choices[0].message.content);

        await movie.update({
          ai_analysis: aiAnalysis,
          last_updated: new Date(),
        });

        console.log(`✅ Analyzed: ${movie.title}`);

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error analyzing ${movie.title}:`, error);
      }
    }

    console.log("🎉 AI analysis complete!");
  } catch (error) {
    console.error("❌ Error in AI analysis:", error);
  }
}

analyzeMoviesWithAI();
