const express = require('express');
const dotenv = require('dotenv');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    next()
})

dotenv.config();

const {OpenAI} = require('openai');

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

async function runCompletion(prompt) {
    const response = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: prompt,
        max_tokens: 50
    });
    return response;
}

app.post('/api/chatgpt', async (req, res) => {
    try {
        const {text} = req.body;
        const response = await runCompletion(text);
        res.status(200)
        res.json({data: response.choices[0].text});
    } catch (error) {
        if (error.response) {
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data)
        } else {
            console.error('Error with OPENAI API request:', error.message);
            res.status(500).json({
                error: {
                    message: 'An error occured during your request.'
                }
            })
        }
    }
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
