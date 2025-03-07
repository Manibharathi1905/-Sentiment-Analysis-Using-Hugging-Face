require('dotenv').config();
console.log("HF_API_KEY Loaded:", process.env.HF_API_KEY ? "Yes" : "No");

const config = {
    HF_API_KEY: process.env.HF_API_KEY, 
    PORT: process.env.PORT || 5000
};

module.exports = config;
