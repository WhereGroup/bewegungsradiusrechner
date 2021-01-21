import React, { useState } from "react";
import { MapContextProvider } from "./MapContext";

const MapComponentsProvider = ({ children }) => {
  const ContextProvider = MapContextProvider;
  const [map, setMap] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);

  const value = {
    map: map,
    setMap: setMap,
    mapLocation: mapLocation,
    setMapLocation: setMapLocation,
    loading: false,
  };

  return <MapContextProvider value={value}>{children}</MapContextProvider>;
};

export default MapComponentsProvider;
