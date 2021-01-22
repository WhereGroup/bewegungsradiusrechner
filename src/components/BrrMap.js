import React, { useEffect, useContext } from "react";
import MapContext from "../mapcomponents/MapContext";

import LoadingOverlay from "react-loading-overlay";
import { ReactComponent as LoadingLogo } from "../assets/loadingLogo.svg";

import MapLibreMap from "../mapcomponents/MapLibreMap";
import ErrorMessage from "../mapcomponents/ErrorMessage";

import { getEmptyFeatureCollection } from "../mapcomponents/MapLibreMap/utils.js";

const BrrMap = (props) => {
  const mapContext = useContext(MapContext);
  const map = mapContext.map;

  const mapOptions = {
    style: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
    center: [8.607, 53.1409349],
    zoom: 10,
    maxBounds: [
      [1.40625, 43.452919],
      [17.797852, 55.973798],
    ],
  };

  useEffect(() => {
    if (map && !map.getSource("point-radius")) {
      const markerImages = {
        marker: "/marker.png",
        syringe: "/syringe.png",
      };

      let markerImagesLoaded = 0;

      const loadMarkerImagesAsync = (done_loading) => {
        for (var name in markerImages) {
          loadMarkerImage(markerImages[name], name, done_loading);
        }
      };

      const loadMarkerImage = (src, name, done_loading) => {
        map.loadImage(src, (error, img) => {
          if (error) {
            throw error;
          }

          if (!map.hasImage(name)) map.addImage(name, img);

          markerImagesLoaded++;

          if (markerImagesLoaded === Object.keys(markerImages).length) {
            done_loading();
          }
        });
      };

      loadMarkerImagesAsync(() => {
        map.addSource("point-radius", {
          type: "geojson",
          data: getEmptyFeatureCollection(),
        });
        map.addSource("search", {
          type: "geojson",
          data: getEmptyFeatureCollection(),
        });

        map.addLayer({
          id: "fill-radius-layer",
          type: "fill",
          source: "point-radius",
          paint: {
            "fill-color": "#007cbf",
            "fill-opacity": 0.5,
          },
        });
        map.addLayer({
          id: "search-fill-layer",
          type: "fill",
          source: "search",
          paint: {
            "fill-color": "red",
            "fill-opacity": 0.5,
          },
        });
        map.addLayer({
          id: "search-point",
          type: "symbol",
          source: "search",
          filter: ["==", "$type", "Point"],
          "icon-image": "marker",
          layout: {
            "icon-image": "marker",
            "icon-size": 0.06,
            "icon-allow-overlap": true,
          },
        });

        mapContext.setLoading(false);

        navigator.geolocation.getCurrentPosition((position) => {
          map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
          });
        });
      });
    }
  }, [map]);

  return (
    <LoadingOverlay
      active={mapContext.loading}
      spinner={<LoadingLogo width="20%" />}
      text={mapContext.loadingMsg}
    >
      <MapLibreMap options={mapOptions} />

      <ErrorMessage />
    </LoadingOverlay>
  );
};

export default BrrMap;
