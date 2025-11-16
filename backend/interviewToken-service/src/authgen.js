const { GoogleGenAI } = require("@google/genai");

if(!process.env.GEMINI_API_LIVE_TOKEN || process.env.GEMINI_API_LIVE_TOKEN.length === 0) {
    throw new Error("No GEMINI_API_LIVE_TOKEN environment variable");
}

const client = new GoogleGenAI({
    httpOptions: { apiVersion: "v1alpha" },
    apiKey: process.env.GEMINI_API_LIVE_TOKEN
});

function generateEphemeralToken() {
    // Définir la durée d'expiration
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // +30 min
    const newSessionExpireTime = new Date(Date.now() + 1 * 60 * 1000).toISOString(); // +1 min

    return new Promise((resolve, reject) => {
        client.authTokens.create({
            config: {
                uses: 1,  // nombre d'utilisations du token
                expireTime: expireTime,
                newSessionExpireTime: newSessionExpireTime,
                httpOptions: { apiVersion: "v1alpha" }
            }
        }).then(token => {
            resolve(token);
        }).catch(reject)
    })
}

module.exports = generateEphemeralToken;