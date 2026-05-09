/**
 * Inizializza la mappa Leaflet dei clienti su chi-siamo.html.
 * Usa MarkerClusterGroup con custom iconCreateFunction (conic-gradient).
 * Esce in modo sicuro se Leaflet o i dati non sono presenti.
 */
(function () {
  "use strict";

  var mapEl = document.getElementById("clienti-map");
  if (!mapEl) return;
  if (typeof L === "undefined") return;
  if (typeof CLIENTI_DATA === "undefined" || !Array.isArray(CLIENTI_DATA)) return;

  try {
    var map = L.map(mapEl, {
      center: [41.9028, 12.4964],
      zoom: 9,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      attributionControl: false
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap &copy; CARTO"
    }).addTo(map);

    var clusters = L.markerClusterGroup({
      maxClusterRadius: 40,
      disableClusteringAtZoom: 14,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function (cluster) {
        var markers = cluster.getAllChildMarkers();
        var total = markers.length;
        var cond = 0;
        for (var i = 0; i < markers.length; i++) {
          if (markers[i].options.tipo === "condominio") cond++;
        }
        var pctCond = total > 0 ? Math.round((cond / total) * 100) : 0;
        var size = total > 100 ? "lg" : total > 30 ? "md" : "sm";
        var sizes = { sm: 42, md: 52, lg: 64 };
        var bg = "conic-gradient(#c41e1a 0% " + pctCond + "%, #d97706 " + pctCond + "% 100%)";
        return L.divIcon({
          html:
            '<div class="cluster-ring" style="background:' + bg + '">' +
              '<div class="cluster-core cluster-' + size + '">' + total + "</div>" +
            "</div>",
          className: "custom-cluster",
          iconSize: L.point(sizes[size], sizes[size])
        });
      }
    });

    var iconCond = L.divIcon({ className: "marker-dot marker-cond", iconSize: [12, 12] });
    var iconPriv = L.divIcon({ className: "marker-dot marker-priv", iconSize: [12, 12] });

    for (var j = 0; j < CLIENTI_DATA.length; j++) {
      var p = CLIENTI_DATA[j];
      if (!p || typeof p.lat !== "number" || typeof p.lng !== "number") continue;
      var icon = p.tipo === "condominio" ? iconCond : iconPriv;
      clusters.addLayer(L.marker([p.lat, p.lng], { icon: icon, tipo: p.tipo }));
    }

    map.addLayer(clusters);
  } catch (err) {
    if (window.console && console.error) {
      console.error("Errore inizializzazione mappa clienti:", err);
    }
  }
})();
