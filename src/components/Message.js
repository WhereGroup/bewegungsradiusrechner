import react from "react";
import Toast from "react-bootstrap/Toast";

const Message = props => {
  const setShowMessage = props.setShowMessage;
  const showMessage = props.showMessage;
  const body = props.body;


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
        onClose={() => setShowMessage(false)}
        show={showMessage}
        delay={3000}
        autohide
      >
        <Toast.Header>
          <strong className="mr-auto">Hinweis</strong>
        </Toast.Header>
        <Toast.Body>
          {body}
        </Toast.Body>
      </Toast>
    </div>
  );
}

export default Message;
