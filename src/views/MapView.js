import React, { useState, useContext } from "react";
import { ReactComponent as LoadingLogo } from "../assets/loadingLogo.svg";
import BrrMap from "../components/BrrMap";
import MapTopbar from "../components/MapTopbar";

import MapContext from "../mapcomponents/MapContext.js";
import MapComponentsProvider from "../mapcomponents/MapComponentsProvider.js";

const MapView = () => {
  const mapContext = useContext(MapContext);

  return (
    <MapComponentsProvider>
      <MapTopbar />

      {/** BewegungsRadiusRechner-Map **/}
      <BrrMap />
    </MapComponentsProvider>
  );
};

export default MapView;
