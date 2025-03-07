const express = require('express');
const cors = require('cors');
const { HfInference } = require("@huggingface/inference");
require("dotenv").config({path:'./'})

// ✅ Replace with your actual API key
const HF_API_KEY = process.env.HF_API_KEY;

const config = { HF_API_KEY, PORT: process.env.PORT || 5000 };
const app = express();
app.use(express.json());
app.use(cors());

const client = new HfInference(HF_API_KEY);

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ reply: "⚠️ Message cannot be empty." });

    try {
        const output = await client.textClassification({
            model: "Dmyadav2001/Sentimental-Analysis",
            inputs: userMessage,
        });

        if (!output || output.length === 0) {
            return res.status(500).json({ reply: "❌ No sentiment detected." });
        }

        // Mapping labels (label-0 -> Negative, label-1 -> Positive, label-2 -> Neutral)
        const labelMap = {
            "LABEL_0": "Negative",
            "LABEL_1": "Positive",
            "LABEL_2": "Neutral"
        };

        const sentimentLabel = output[0]?.label || "Unknown";
        const sentiment = labelMap[sentimentLabel] || "Unknown";
        const confidence = (output[0]?.score * 100).toFixed(2); // Convert to percentage

        // 🟢 Positive, 🔴 Negative, ⚪ Neutral
        let emoji = "⚪";
        let color = "gray"; // Default neutral color
        let message = `💬 Your message: "${userMessage}"`;

        if (sentiment === "Positive") {
            emoji = "🟢";
            color = "green";
        } else if (sentiment === "Negative") {
            emoji = "🔴";
            color = "red";
        }

        const response = {
            reply: `${emoji} **Sentiment:** ${sentiment}  
                     🎯 **Confidence:** ${confidence}%  
                     ${message}`,
            sentiment: sentiment,
            confidence: confidence,
            color: color
        };

        res.json(response);
    } catch (error) {
        console.error("❌ Hugging Face API Error:", error);
        res.status(500).json({ reply: "🚨 Error fetching response from AI." });
    }
});

app.listen(config.PORT, () => console.log(`✅ Server running at http://localhost:${config.PORT}`));
