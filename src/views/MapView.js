import React from "react";
import BrrMap from "../components/BrrMap";
import MapTopbar from "../components/MapTopbar";

import MapComponentsProvider from "../mapcomponents/MapComponentsProvider.js";

const MapView = () => {
  return (
    <MapComponentsProvider>
      <MapTopbar />

      {/** BewegungsRadiusRechner-Map **/}
      <BrrMap />
    </MapComponentsProvider>
  );
};

export default MapView;
