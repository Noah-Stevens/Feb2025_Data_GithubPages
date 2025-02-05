// Step 1: CREATE THE BASE LAYERS
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  
  
  // Store the API query variables.
  // For docs, refer to https://dev.socrata.com/docs/queries/where.html.
  // And, refer to https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9.
  let baseURL = "https://data.cityofnewyork.us/resource/fhrw-4uyv.json?";
  // Add the dates in the ISO formats
  let date = "$where=created_date between'2024-01-01T00:00:00' and '2025-01-01T00:00:00'";
  // Add the complaint type.
  let complaint = "&complaint_type=Rodent";
  // Add a limit.
  let limit = "&$limit=10000";
  
  // Assemble the API query URL.
  let url = baseURL + date + complaint + limit;
  console.log(url);
  
  d3.json(url).then(function (data) {
    // Step 2: CREATE THE DATA/OVERLAY LAYERS
    console.log(data);
  
    // Initialize the Cluster Group
    let heatArray = [];
    let markers = L.markerClusterGroup();
  
    // Loop and create marker
    for (let i = 0; i < data.length; i++){
      let row = data[i];
      let location = row.location;
      if(location){
        let marker = L.marker([location.coordinates[1], location.coordinates[0]]).bindPopup(`<h1>${row.incident_address}</h1><h3>${row.descriptor}</h3><h4>${row.created_date}</h4>`);
        markers.addLayer(marker);
  
        // Heatmap point
        heatArray.push([location.coordinates[1], location.coordinates[0]]);
      }
    }
  
    // Create Heatmap Layer
    let heatLayer = L.heatLayer(heatArray, {
      radius: 25,
      blur: 10
    });
  
    // Step 3: CREATE THE LAYER CONTROL
    let baseMaps = {
      Street: street,
      Topography: topo
    };
  
    let overlayMaps = {
      Rodents: markers,
      HeatMap: heatLayer
    };
  
    // Step 4: INITIALIZE THE MAP
    let myMap = L.map("map", {
      center: [40.7128, -74.0059],
      zoom: 11,
      layers: [street, markers]
    });
  
    // Step 5: Add the Layer Control, Legend, Annotations as needed
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  
  });