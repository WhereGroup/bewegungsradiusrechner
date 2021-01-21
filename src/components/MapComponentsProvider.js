import React, { useState } from "react";
import { MapContextProvider } from "./MapContext";

const MapComponentsProvider = ({ children }) => {
  const ContextProvider = MapContextProvider;
  const [map, setMap] = useState(null);

  const value = {
    map: map,
    setMap: setMap,
    loading: false,
  };

  return <MapContextProvider value={value}>{children}</MapContextProvider>;
};

export default MapComponentsProvider;
