var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
var contador_fotos = 1;
var contador_tags = 0;
var tag;
var interval;
var dificultad;
var tiempo;
var latFoto;
var longFoto;
var latLng;
var puntuacionFoto;
var tipoJuego;
var value = 0;
var map;
var vieneHistorial = false;
var contador_history = 0;
var puntuacionTotal = 0;

function tiempoDificultad(dificultad) {
  if(dificultad == "facil")
    tiempo = 6000;
  else if(dificultad == "medio")
    tiempo = 4000;
  else if(dificultad == "dificil")
    tiempo = 1000;
  return tiempo;
}

$("#dificultad").change(function(){
  dificultad = $("#dificultad").val();
  tiempo = tiempoDificultad(dificultad);
  $("#dificultad").prop('disabled', true);
  $("#tipo_juego").prop('disabled', false);
}); 

function pedirFotos(tag){
  $.getJSON( flickerAPI, {
    tags: tag,
    tagmode: "any",
    format: "json"
  })
  .done(function( data ) {
    console.log("ME LLAMAN");
      interval = setInterval(function() {
        var foto = data.items[contador_fotos].media.m;
        cambiarFoto(foto);
        cambiarContadorFoto(contador_fotos);
        contador_fotos++;
        if(contador_fotos == 11)
        	clearInterval(interval);
      }, tiempo);
  });
}


function cambiarFoto(foto) {
  $("#fotos").css("display","block");
  $("#images").empty();
  $( "<img class='imagenn'>" ).attr( "src", foto ).appendTo( "#images" );
}

function cambiarContadorFoto(contador) {
  $("#contador_fotos").html(contador_fotos + "/10");
}

function inicializarValores() {
  contador_fotos = 1;
  puntuacionTotal = 0;
  clearInterval(interval);
}
function cogerJson(tipoJuego) {
  $.getJSON( tipoJuego+".json")
   .done(function( data ) {
     tag = data.juego[contador_tags];
     pedirFotos(tag.properties.name);
     contador_tags++;
     //$( "#map" ).click(function() {
     map.on('click',function(e){
      if(contador_tags == 4){
        alert("SE ACABO EL JUEGO");
      }else{
        inicializarValores(); 
        $("#puntuacion").css("display","block");
        tag = data.juego[contador_tags].properties.name;
        latFoto = data.juego[contador_tags].geometry.coordinates.toString().split(",")[0];
        longFoto = data.juego[contador_tags].geometry.coordinates.toString().split(",")[0];
        calcularPuntuacion();
        pedirFotos(tag);
        contador_tags++;
      }
     });
   });
}

function calcularPuntuacion() {
  var latlngJson = L.latLng(latFoto,longFoto);
  var distancia = latLng.distanceTo(latlngJson)/1000;
  puntuacionFoto = distancia * contador_fotos;
  if (puntuacionFoto < 0)
    puntuacionFoto = puntuacionFoto * (-1);
  puntuacionTotal = puntuacionTotal + puntuacionFoto;
  $("#puntuacion").text("Puntuacion : " + puntuacionTotal);
}
$("#tipo_juego").change(function(){
    $("#tipo_juego").prop('disabled', true);
    $("#nuevo").prop('disabled', false);
    $("#iniciar").prop('disabled', false);
    $("#abortar").prop('disabled', false);  
});

function hora(){
  var date = new Date()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  if (hour < 10) {hour = "0" + hour}
  if (minute < 10) {minute = "0" + minute}
  if (second < 10) {second = "0" + second}
  var finalHour = hour + ":" + minute + ":" + second;
  return finalHour;
}

function guardarJuego(){
  console.log("ENTRO EN GUARDAR JUEGO");
  var stateObj = {
    puntuacionGuardada: puntuacionTotal,
    tipoJuego : tipoJuego,
    dificultad : dificultad,
    contador_tags : contador_tags,
    contador_fotos : contador_fotos
  };
  history.replaceState(stateObj ,null,"?juego=" + tipoJuego);
  console.log(stateObj);
  $("#historial").append('<li ><a value="'+contador_history+'"> '+tipoJuego + ' ' + hora() +  '</a></li>');
  console.log("ANTES DE AUMENTAR HISTORY " + contador_history);
  contador_history++;
  console.log("DESPUES DE AUMENTAR HISTORY " + contador_history);
}

function pushJuego(){
  var stateObj = {
    puntuacionGuardada: puntuacionTotal,
    tipoJuego : tipoJuego,
    dificultad : dificultad,
    contador_tags : contador_tags,
    contador_fotos : contador_fotos
  };
  history.pushState(stateObj ,null,"?juego=" + tipoJuego);
}
function rellenarStateObj(){  
  stateObj[puntuacionGuardada] = puntuacionTotal;
  console.log("puntuacion : " + stateOb);
  stateObj["tipoJuego"] = tipoJuego;
  stateObj["dificultad"] = dificultad;
  stateObj["contador_fotos"] = contador_fotos;
  stateObj["contador_tags"] = contador_tags;
}


window.onpopstate = function(event) {
  console.log("CONTADOR DENTROOOOOO" + contador_history);
  //alert("location: " + document.location + ", state: " + JSON.stringify(event.state.puntuacionGuardada));
  alert("Retomando juego en su estado pasado");
  $("#puntuacion").html(JSON.stringify(event.state.puntuacionGuardada));
  $("#dificultad option[value="+JSON.stringify(event.state.dificultad)+"]").attr('selected', 'selected');
  $("#tipo_juego option[value="+JSON.stringify(event.state.tipoJuego)+"]").attr('selected', 'selected');
  contador_tags = JSON.stringify(event.state.contador_tags);
  contador_fotos = JSON.stringify(event.state.contador_fotos);
  vieneHistorial = true;
};
function bloquearSelects(){
  $("#tipo_juego").prop('disabled', false);
  $("#dificultad").prop('disabled', false);
}
function reiniciarSelects(){
  $("#dificultad option[value=dificultad]").attr('selected', 'selected');
  $("#tipo_juego option[value=tipo_juego]").attr('selected', 'selected');
  $("#tipo_juego").prop('disabled', true);
  $("#dificultad").prop('disabled', false);
}
function bloquarBotonoes(){
  $("#nuevo").prop('disabled', true);
  $("#iniciar").prop('disabled', true);
  $("#abortar").prop('disabled', true);
  $("#fotos").css("display","none");
}
$("#box-historial").on("click","a",function(){
  console.log("dentro");
  var valor = $(this).attr("value");
  cambiarHistory(valor);
});

function cambiarHistory(valor){
  var ir = valor - contador_history;
  contador_history = valor;
  if(ir != 0){
    inicializarValores();
    history.go(ir);
  }else{
    alert("ESTAS EN ESE JUEGO");
  }
}

$(document).ready(function() {  
  $("#iniciar").click(function(){
    inicializarValores();
    bloquearSelects();
    function onMapClick(e) {
      latLng = e.latlng; 
      clearInterval(interval);
    }
    map.on('click', onMapClick);
    tipoJuego = $("#tipo_juego").val();
    vieneHistorial = true;
    cogerJson(tipoJuego);
    pushJuego();
  });
  $("#nuevo").click(function(){
    contador_tags = 0;
    map.off('click');
    clearInterval(interval);
    reiniciarSelects();
    guardarJuego();
  });

  map = L.map('map').setView([43.841471, -39.541545],2);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
});



