import react, { useContext } from "react";
import MapContext from "../mapcomponents/MapContext";

import Toast from "react-bootstrap/Toast";

const Message = (props) => {
  const setShowMessage = props.setShowMessage;
  const showMessage = props.showMessage;
  const body = props.body;

  const mapContext = useContext(MapContext);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        float: "right",
        margin: "auto",
        zIndex: 2,
      }}
    >
      <Toast
        onClose={() => mapContext.setShowErrorMessage(false)}
        show={mapContext.showErrorMessage}
        delay={3000}
        autohide
      >
        <Toast.Header>
          <strong className="mr-auto">Hinweis</strong>
        </Toast.Header>
        <Toast.Body>{mapContext.errorMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default Message;
