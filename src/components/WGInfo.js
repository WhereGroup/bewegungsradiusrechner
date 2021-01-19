import react from "react";
import Toast from "react-bootstrap/Toast";
import { FiTwitter, FiGithub } from "react-icons/fi";
import { IconContext } from "react-icons";
import {  BiHomeHeart } from "react-icons/bi";

const WGInfo = props => {
  const setShowWGInfo = props.setShowWGInfo;
  const showWGInfo = props.showWGInfo;

  return <div
    style={{
      position: "absolute",
      top: 0,
      zIndex: 2,
      margin: "auto",
    }}
  >
    <Toast onClose={() => setShowWGInfo(false)} show={showWGInfo}>
      <Toast.Header as="h3">made by WhereGroup GmbH </Toast.Header>
      <Toast.Body>
        find us here: <br />
        <IconContext.Provider
          value={{ color: "black", size: "2em", className: "whereToFind" }}
        >
          <a href="https://wheregroup.com/" target="_blank">
            <BiHomeHeart value={{ size: "2em" }} />
          </a>
          <a href="https://github.com/WhereGroup" target="_blank">
            <FiGithub />
          </a>
          <a href="https://twitter.com/WhereGroup_com/" target="_blank">
            <FiTwitter />
          </a>
        </IconContext.Provider>
      </Toast.Body>
    </Toast>
  </div>;
}

export default WGInfo;
