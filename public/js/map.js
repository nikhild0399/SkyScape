const lat = "<%= OneListing.geometry.coordinates[1] %>";
  const lng = "<%= OneListing.geometry.coordinates[0] %>";

  const map = L.map('map').setView([lat, lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup('<h3><%= OneListing.title %></h3><p>Exact location will be shared after booking.</p>')
    .openPopup();