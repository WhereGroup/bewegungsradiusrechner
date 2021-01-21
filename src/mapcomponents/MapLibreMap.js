import React, { useState, useRef, useEffect, useContext } from "react";
import mapboxgl from "maplibre-gl";
import "maplibre-gl/dist/mapbox-gl.css";
import MapContext from './MapContext';

import "maplibre-gl/dist/mapbox-gl.css";

const MapLibreMap = (props) => {

  const map = useRef(null);
  const mapContainer = useRef(null);

  const mapContext = useContext(MapContext);

  mapContext.loading = true;

  const mapOptions = props.options;

  useEffect(() => {

    let defaultOptions = {
      lng: 8.607,
      lat: 53.1409349,
      zoom: 10,
      container: mapContainer.current,
    };

    map.current = new mapboxgl.Map({ ...defaultOptions, ...mapOptions});

    mapContext.setMap( map.current );
  }, []);

  return <div ref={mapContainer} className="mapContainer" />;
};

export default MapLibreMap;
