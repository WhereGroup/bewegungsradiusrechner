import React, { useState,useEffect, useContext } from "react";
import MapContext from "../mapcomponents/MapContext";

import Button from "react-bootstrap/Button";

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
