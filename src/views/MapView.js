import React, { useState, useEffect } from "react";
import LoadingOverlay from "react-loading-overlay";
import { ReactComponent as LoadingLogo } from "../assets/loadingLogo.svg";
import BrrMap from "../components/BrrMap";
import MapTopbar from "../components/MapTopbar";

import MapComponentsProvider from "../mapcomponents/MapComponentsProvider.js";

const MapView = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const [locationValue, setLocationValue] = useState(null);
  const [showVacSites, setShowVacSites] = useState(false);

  const [createPdfTrigger, setCreatePdfTrigger] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLoadingMsg("loading");
    }
  }, [loading]);

  return (
    <MapComponentsProvider>
      <LoadingOverlay
        active={loading}
        spinner={<LoadingLogo width="20%" />}
        text={loadingMsg}
      >
        <MapTopbar />

        <BrrMap
          locationValue={locationValue}
          setLocationValue={setLocationValue}
          createPdfTrigger={createPdfTrigger}
          setCreatePdfTrigger={setCreatePdfTrigger}
          setLoading={setLoading}
          showVacSites={showVacSites}
        />
      </LoadingOverlay>
    </MapComponentsProvider>
  );
};

export default MapView;
