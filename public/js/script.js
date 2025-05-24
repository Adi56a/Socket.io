document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    const map = L.map('map').setView([0, 0], 2); // Initial neutral zoom
    const markers = {};

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data © OpenStreetMap contributors"
    }).addTo(map);

    // Watch the user's location
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Send location to server
                socket.emit('send-location', { latitude, longitude });

                // Center the map and place your marker
                map.setView([latitude, longitude], 15);

                if (markers['you']) {
                    markers['you'].setLatLng([latitude, longitude]);
                } else {
                    markers['you'] = L.marker([latitude, longitude], {
                        title: "You"
                    }).addTo(map);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }

    // Handle locations from other clients
    socket.on('received-location', (data) => {
        const { id, latitude, longitude } = data;

        if (id === socket.id) return; // Skip self

        if (markers[id]) {
            markers[id].setLatLng([latitude, longitude]);
        } else {
            markers[id] = L.marker([latitude, longitude], {
                title: `User: ${id}`
            }).addTo(map);
        }
    });
});
