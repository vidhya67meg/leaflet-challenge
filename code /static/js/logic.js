// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Define a markerSize() function that will give each earthquake radius based on magnitude
    function markerSize(magnitude) {
      return Math.sqrt(magnitude)*5;
    }
    function getMarkerColor(depth) {
      let color = "";
      if (depth> 90.0) {
        color = "red";
      }
      else if (depth > 70.0 && depth <= 90.0) {
        color = "orange";
      }
      else if (depth > 50.0 && depth <= 70.0) {
        color = "yellow";
      }
      else if (depth > 30.0 && depth <= 50.0) {
        color = "lightyellow";
      }
      else if (depth > 10.0 && depth <= 30.0) {
        color = "lime";
      }
      else {
        color = "green";
      }
      return color
    }

    function pointToLayer(feature, latlng) {
      return L.circleMarker(
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
        {
        fillOpacity: 0.75,
        color: "white",
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        // Setting our circle's radius to equal the output of our markerSize() function:
        // This will make our marker's size proportionate to its population.
        radius: markerSize(feature.properties.mag)
      })
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: pointToLayer,
      onEachFeature: onEachFeature
    });
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  

// Create a baseMaps object.
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      24.99, -28.81
    ],
    zoom: 2,
    layers: [street, earthquakes]
  });

  let legend = L.control({ position: 'bottomright' });
  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [0, 10, 30, 50, 70, 90];
    let colors = ['green', 'lime', 'lightyellow', 'yellow', 'orange', 'red'];
    
  
    for (let i = 0; i < depths.length; i++) {
      if (i === 0) {
        div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          '< ' + depths[i + 1] + '<br>';
      } else if (i === depths.length - 1) {
        div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          depths[i] + '+';
      } else {
        div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          depths[i] + '&ndash;' + depths[i + 1] + '<br>';
      }
    }
  return div;
}
 legend.addTo(myMap);
}


  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);
  



