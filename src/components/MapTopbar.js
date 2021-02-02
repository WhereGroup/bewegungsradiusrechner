import React, { useState } from "react";
import MapSearchInput from "../components/MapSearchInput";
import WGInfo from "../components/WGInfo";
import Tutorial from "../components/Tutorial";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { ReactComponent as WGLogo } from "../assets/wheregroup-logo-icon.svg";
import Button from "react-bootstrap/Button";
import { BsInfoCircle } from "react-icons/bs";

import ShowVacSitesButton from "./ShowVacSitesButton";
import CreatePdfButton from "./CreatePdfButton";

const MapTopbar = () => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [showWGInfo, setShowWGInfo] = useState(false);

  return (
    <>
      {" "}
      <Tutorial showTutorial={showTutorial} setShowTutorial={setShowTutorial} />
      <WGInfo showWGInfo={showWGInfo} setShowWGInfo={setShowWGInfo} />
      <div className="overlay">
        <Nav as="ul" className="glass">
          <Nav.Item className="navbtn" as="li">
            <Navbar.Text>
              {" "}
              <WGLogo width="16px" height="21px" /> Bewegungsradiusrechner
            </Navbar.Text>
          </Nav.Item>
          <Nav.Item className="autosuggest-container-nav" as="li">
            <MapSearchInput />
          </Nav.Item>
          <Nav.Item className="navbtn" as="li">
            <CreatePdfButton />
          </Nav.Item>
          <Nav.Item className="navbtn" as="li">
            <ShowVacSitesButton />
          </Nav.Item>
          <Nav.Item className="navbtn" as="li">
            <Button variant="light" onClick={() => setShowWGInfo(!showWGInfo)}>
              <WGLogo width="16px" height="21px" />
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
    </>
  );
};

export default MapTopbar;
