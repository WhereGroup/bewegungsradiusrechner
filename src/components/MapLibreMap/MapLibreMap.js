import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "maplibre-gl";
import "maplibre-gl/dist/mapbox-gl.css";
import centroid from "@turf/centroid";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import lineToPolygon from "@turf/line-to-polygon";

import createPdf from "./createPdf.js";

var map = null;
const MapLibreMap = (props) => {
  const locationValue = props.locationValue;
  const setLocationValue = props.setLocationValue;
  const mapContainer = useRef(null);

  const [state, setState] = useState({
    lng: 8.607,
    lat: 53.1409349,
    zoom: 10,
    map: null,
    value: "",
    selected: "",
    suggestions: [],
    showMessage: false,
    loading: false,
    showWGInfo: false,
  });

  const createPdfTrigger = props.createPdfTrigger;
  const setCreatePdfTrigger = props.setCreatePdfTrigger;
  const setLoading = props.setLoading;

  useEffect(() => {
    if(createPdfTrigger){
      createPdf(map, locationValue, setLoading);
      setCreatePdfTrigger(false);
    }
  },[createPdfTrigger]);

  useEffect(() => {
    const blank = {
      version: 8,
      name: "Blank",
      center: [0, 0],
      zoom: 0,
      sources: {},
      //"sprite": window.location.origin + process.env.PUBLIC_URL + "/sprites/osm-liberty",
      glyphs: "mapbox://fonts/openmaptiles/{fontstack}/{range}.pbf",
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": "rgba(255,255,255,1)" },
        },
      ],
      id: "blank",
    };

    const maxBounds = [
      [1.40625, 43.452919],
      [17.797852, 55.973798],
    ];

    map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      center: [state.lng, state.lat],
      zoom: state.zoom,
      maxBounds: maxBounds,
    });

    map.on("move", () => {
      setState({
        ...state,
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
    });

    map.on("load", async () => {
      const markerImage = await loadMarkerImage(
        process.env.PUBLIC_URL + "/marker.png"
      );
      const syringeImage = await loadMarkerImage(
        process.env.PUBLIC_URL + "/syringe.png"
      );

      map.addImage("marker", markerImage);
      map.addImage("syringe", syringeImage);

      getVacCenters();

      navigator.geolocation.getCurrentPosition((position) => {
        setCenterToLongLat(position.coords.longitude, position.coords.latitude);
      });

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
    });
  }, []);

  const setCenterToLongLat = (longitude, latitude) => {
    map.flyTo({
      center: [longitude, latitude],
    });
  };

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
            //'text-justify': 'auto',
            //'text-allow-overlap': true
          },
        });
      });
  };

  useEffect(() => {
    if (map && locationValue && typeof locationValue.geojson !== "undefined") {
      const data = getEmptyFeatureCollection();
      const sourceData = getEmptyFeatureCollection();
      const centroidFromSuggestion = centroid(locationValue.geojson);

      const gjson =
        locationValue.geojson === "LineString"
          ? lineToPolygon(locationValue.geojson)
          : locationValue.geojson;
      const circleFromSuggestion = buffer(gjson, 16.5, { steps: 360 });
      const origin = getEmptyFeature(
        locationValue.geojson.type,
        locationValue.geojson.coordinates
      );
      const bboxBuffer = bbox(circleFromSuggestion);
      data.features.push(...[circleFromSuggestion]);
      sourceData.features.push(...[origin]);

      map.getSource("point-radius").setData(data);
      map.getSource("search").setData(sourceData);

      map.fitBounds(bboxBuffer, { padding: 100 });
    }
  }, [locationValue]);

  return <div ref={mapContainer} className="mapContainer" />;
};

export default MapLibreMap;
