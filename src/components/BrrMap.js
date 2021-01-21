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
    if (map) {
      map.on("move", () => {
        /*setState({
        ...state,
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
      */
      });

      map.on("load", async () => {
        if (!map.getSource("point-radius")) {
          const markerImage = await loadMarkerImage("/marker.png");
          const syringeImage = await loadMarkerImage("/syringe.png");

          map.addImage("marker", markerImage);
          map.addImage("syringe", syringeImage);

          navigator.geolocation.getCurrentPosition((position) => {
            map.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
            });
          });

          await map.addSource("point-radius", {
            type: "geojson",
            data: getEmptyFeatureCollection(),
          });
          await map.addSource("search", {
            type: "geojson",
            data: getEmptyFeatureCollection(),
          });

          await map.addLayer({
            id: "fill-radius-layer",
            type: "fill",
            source: "point-radius",
            paint: {
              "fill-color": "#007cbf",
              "fill-opacity": 0.5,
            },
          });
          await map.addLayer({
            id: "search-fill-layer",
            type: "fill",
            source: "search",
            paint: {
              "fill-color": "red",
              "fill-opacity": 0.5,
            },
          });
          await map.addLayer({
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
        }
      });
    }
  }, [map]);

  const loadMarkerImage = async (src) => {
    let image;

    await new Promise(async (p, r) => {
      await map.loadImage(src, async (error, img) => {
        if (error) {
          r();
          throw error;
        }
        image = img;
        p();
      });
    });

    return image;
  };

  return (
    <LoadingOverlay
      active={mapContext.loading}
      spinner={<LoadingLogo width="20%" />}
      text={mapContext.loadingMsg}
    >
      <MapLibreMap options={mapOptions} />

      <ErrorMessage
      />
    </LoadingOverlay>
  );
};

export default BrrMap;
