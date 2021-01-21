import React, { useState,useEffect, useContext } from "react";
import MapContext from "../mapcomponents/MapContext";

import Button from "react-bootstrap/Button";
import {getEmptyFeatureCollection, getEmptyFeature} from '../mapcomponents/MapLibreMap/utils.js';

const ShowVacSitesButton = () => {
  const [showVacSites, setShowVacSites] = useState(false);

  const mapContext = useContext(MapContext);
  const map = mapContext.map;

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

  useEffect(() => {
    if(map){
      getVacCenters();
    }
  }, [map]);

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


  return (
    <Button
      variant={showVacSites ? "warning" : "light"}
      onClick={() => setShowVacSites(!showVacSites)}
    >
      <img src="/syringe.png" width="16" alt="" />
    </Button>
  );
};

export default ShowVacSitesButton;
