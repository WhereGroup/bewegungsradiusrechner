import React, { useState, useEffect } from "react";
import LoadingOverlay from "react-loading-overlay";
import { ReactComponent as LoadingLogo } from "../assets/loadingLogo.svg";
import MapLibreMap from "../components/MapLibreMap/MapLibreMap";
import MapSearchInput from "../components/MapSearchInput";
import WGInfo from "../components/WGInfo";
import Message from "../components/Message";
import Tutorial from "../components/Tutorial";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { ReactComponent as WGLogo } from "../assets/wheregroup-logo-icon.svg";
import { BiPrinter } from "react-icons/bi";
import Button from "react-bootstrap/Button";
import { BsInfoCircle } from "react-icons/bs";

import MapComponentsProvider from "../mapcomponents/MapComponentsProvider.js";

const MapView = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const [locationValue, setLocationValue] = useState(null);
  const [showVacSites, setShowVacSites] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showWGInfo, setShowWGInfo] = useState(false);

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
        <Tutorial
          showTutorial={showTutorial}
          setShowTutorial={setShowTutorial}
        />
        <Message
          body="Bitte suchen Sie zuerst nach einem Ort oder einer Adresse."
          showMessage={showMessage}
          setShowMessage={setShowMessage}
        />
        <WGInfo showWGInfo={showWGInfo} setShowWGInfo={setShowWGInfo} />

        <div className="overlay">
          <Nav as="ul" className="glass">
            <Nav.Item className="navbtn" as="li">
              <Navbar.Text>
                {" "}
                <WGLogo width="16px" /> Bewegungsradiusrechner
              </Navbar.Text>
            </Nav.Item>
            <Nav.Item className="autosuggest-container-nav" as="li">
              <MapSearchInput
                locationValue={locationValue}
                setLocationValue={setLocationValue}
              ></MapSearchInput>
            </Nav.Item>
            <Nav.Item className="navbtn" as="li">
              <Button
                variant="light"
                onClick={() => {
                  if (!locationValue) {
                    setShowMessage(true);
                    return false;
                  }
                  setLoadingMsg("Erzeuge Pdf");
                  setLoading(true);
                  setCreatePdfTrigger(true);
                  console.log("fertig");
                }}
              >
                <BiPrinter></BiPrinter>
              </Button>
            </Nav.Item>
            <Nav.Item className="navbtn" as="li">
              <Button
                variant={showVacSites ? "warning" : "light"}
                onClick={() => setShowVacSites(!showVacSites)}
              >
                <img src="/syringe.png" width="16" alt="" />
              </Button>
            </Nav.Item>
            <Nav.Item className="navbtn" as="li">
              <Button
                variant="light"
                onClick={() => setShowWGInfo(!showWGInfo)}
              >
                <WGLogo width="16px" />
              </Button>
            </Nav.Item>
            <Nav.Item className="navbtn" as="li">
              <Button
                variant="light"
                onClick={() => setShowTutorial(!showTutorial)}
              >
                {" "}
                <BsInfoCircle />
              </Button>
            </Nav.Item>
          </Nav>
        </div>

        <MapLibreMap
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
