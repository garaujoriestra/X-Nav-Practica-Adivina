var latitud;
var longitud;
var puntuacion;

function separarLatLng(latlng) {
    var coordenada = latlng.toString();
    var spliteado = coordenada.split("(");
    var solo_coordenada = spliteado[1];
    latitud = solo_coordenada.split(",")[0];
    longitud = solo_coordenada.split(",")[1].split(")")[0].split(" ")[1];
    console.log(latitud);
    console.log(longitud);
}

$(document).ready(function() {
	var map = L.map('map').setView([43.841471, -39.541545],2);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

  function onMapClick(e) {
    console.log(e.latlng.toString());
    separarLatLng(e.latlng.toString());
    calcularPuntuacion();
  }
  map.on('click', onMapClick);
});