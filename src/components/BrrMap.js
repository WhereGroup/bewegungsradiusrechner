import React, { useState, useRef, useEffect, useContext } from "react";

import MapLibreMap from "../mapcomponents/MapLibreMap";
import MapContext from '../mapcomponents/MapContext';

import createPdf from "./MapLibreMap/createPdf.js";

import "maplibre-gl/dist/mapbox-gl.css";

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

  // TODO: should be shared using context not passing props
  const createPdfTrigger = props.createPdfTrigger;
  const setCreatePdfTrigger = props.setCreatePdfTrigger;
  const setLoading = props.setLoading;
  const showVacSites = props.showVacSites;

  useEffect(() => {
    if (map) {
      if (!showVacSites) {
        map.setLayoutProperty(
          "vaccination-point",
          "visibility",
          "none"
        );
        map.setLayoutProperty(
          "vaccination-label",
          "visibility",
          "none"
        );
      } else {
        map.setLayoutProperty(
          "vaccination-point",
          "visibility",
          "visible"
        );
        map.setLayoutProperty(
          "vaccination-label",
          "visibility",
          "visible"
        );
      }
    }
  }, [showVacSites]);

  /**useEffect(() => {
    if (map && createPdfTrigger) {
      createPdf(map, locationValue, setLoading);
      setCreatePdfTrigger(false);
    }
  }, [createPdfTrigger]);
  */

  useEffect(() => {
    console.log('MAP EFFECT');

    if(map) {

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
      const markerImage = await loadMarkerImage("/marker.png");
      const syringeImage = await loadMarkerImage("/syringe.png");

      map.addImage("marker", markerImage);
      map.addImage("syringe", syringeImage);

      getVacCenters();

      navigator.geolocation.getCurrentPosition((position) => {
        setCenterToLongLat(position.coords.longitude, position.coords.latitude);
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
    });
    }
  }, [ map ]);

  const getEmptyFeatureCollection = () => {
    return {
      type: "FeatureCollection",
      features: [],
    };
  };
  const getEmptyFeature = (type, coordinates) => {
    return {
      type: "Feature",
      geometry: {
        type: type,
        coordinates: coordinates,
      },
      properties: {
        name: null,
      },
    };
  };


  const setCenterToLongLat = (longitude, latitude) => {
    map.flyTo({
      center: [longitude, latitude],
    });
  };


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

  const getVacCenters = () => {
    fetch("./vaccination.json")
      .then((response) => response.json())
      .then((response) => {
        const featureCollection = getEmptyFeatureCollection();

        response.elements.forEach((e, i, l) => {
          const feature = getEmptyFeature("Point", [e.lon, e.lat]);
          Object.assign(feature.properties, e.tags);
          featureCollection.features.push(feature);
        });

        map.addSource("vaccination", {
          type: "geojson",
          data: featureCollection,
        });

        map.addLayer({
          id: "vaccination-point",
          type: "symbol",
          source: "vaccination",
          "icon-image": "marker",
          layout: {
            "icon-image": "syringe",
            "icon-size": 0.06,
            "icon-allow-overlap": true,
            visibility: "none",
          },
        });

        map.addLayer({
          id: "vaccination-label",
          type: "symbol",
          source: "vaccination",
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Regular"],
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-radial-offset": 0.5,
            visibility: "none",
            //'text-justify': 'auto',
            //'text-allow-overlap': true
          },
        });
      });
  };

  return <MapLibreMap options={mapOptions} />;
};

export default BrrMap;

