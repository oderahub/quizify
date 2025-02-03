const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { HfInference } = require('@huggingface/inference');

const app = express();
const PORT = process.env.PORT || 5000;

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

app.use(cors());
app.use(express.json());

// Serve static files from the directory containing your HTML
app.use(express.static(path.join(__dirname, 'public')));

// Modify the root route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Fetches questions from Hugging Face using the gpt-neo model.
 * @param {string} category - The category for which to generate questions.
 * @param {number} count - Number of questions to generate.
 * @returns {Promise<Array>} Array of question objects.
 */
async function fetchQuestions(category, count) {
    try {
        console.log('API Key:', process.env.HUGGING_FACE_API_KEY ? 'Present' : 'Not found');
        const response = await hf.textGeneration({
            model: 'EleutherAI/gpt-neo-125M',  // Choose the size of the model based on your needs
            inputs: `Generate ${count} multiple-choice quiz questions about ${category}. Each question should have 1 correct answer and 3 related but incorrect options. Format each question like this:
- Question: What is the capital of France?
- Options: A) Paris, B) London, C) Berlin, D) Rome
- Answer: A`,
            parameters: {
                max_new_tokens: 500, // Adjust based on model limits and your needs
                temperature: 0.7,
                top_p: 0.9,
                repetition_penalty: 1.2
            }
        });

        console.log('Model Output:', response.generated_text);
        return parseQuestions(response.generated_text);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return fallbackQuestions(category, count);
    }
}

/**
 * Parses the AI-generated text into an array of question objects.
 * @param {string} responseText - The text response from the AI.
 * @returns {Array} An array of parsed questions.
 */
function parseQuestions(responseText) {
    try {
        // Adjust this regex based on the actual format of returned text
        const regex = /- Question: (.+?)\n- Options: (.+?)\n- Answer: ([ABCD])/g;
        let match;
        const questions = [];

        while ((match = regex.exec(responseText)) !== null) {
            const [, question, optionsString, correctAnswer] = match;
            const options = optionsString.split(',').map(opt => opt.trim());
            questions.push({
                question: question,
                options: options,
                answer: options[correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0)]
            });
        }

        if (questions.length === 0) {
            throw new Error("No questions were parsed from the response.");
        }

        return questions;
    } catch (error) {
        console.error("Error parsing response:", error);
        return [];
    }
}

/**
 * Provides fallback questions if the API fails to generate new ones.
 * @param {string} category - The category for which to generate questions.
 * @param {number} count - Number of questions to generate.
 * @returns {Array} Array of fallback question objects.
 */
function fallbackQuestions(category, count) {
    return Array.from({ length: count }, (_, i) => ({
        question: `Sample question ${i + 1} about ${category}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option A"
    }));
}

// Quiz API route
app.get("/quiz/:category/:count", async (req, res) => {
    const { category, count } = req.params;
    const questions = await fetchQuestions(category, parseInt(count));
    if (questions.length === 0) {
        res.status(500).json({ error: "Failed to retrieve or parse questions." });
    } else {
        res.json({ questions });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});