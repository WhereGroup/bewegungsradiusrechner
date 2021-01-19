import react from "react";
import Toast from "react-bootstrap/Toast";


const Tutorial = props => {
  const setShowTutorial = props.setShowTutorial;
  const showTutorial = props.showTutorial;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "25px",
        zIndex: 2,
        margin: "auto",
      }}
    >
      <Toast onClose={() => setShowTutorial(false)} show={showTutorial}>
        <Toast.Header>
          <strong className="mr-auto">Information</strong>
        </Toast.Header>
        <Toast.Body>
          <span>
            Bundesländer und Kommunen setzen die{" "}
            <strong>15-Kilometer-Radius-Regel</strong> unterschiedlich um. Bitte
            informieren Sie sich bei der für Ihren Wohnort zuständigen Behörde.{" "}
          </span>
          <hr />
          <span>
            Mit diesem Tool können Sie den Bewegungsradius für eine Stadt oder
            eine Adresse bestimmen. Geben Sie dazu einfach den gewünschten Ort
            in das Suchfeld ein und wählen Sie einen Eintrag aus der
            erscheinenden Liste. Mit dem Drucksymbol können Sie die aktuelle
            Kartenansicht als PDF herunterladen und ausdrucken.{" "}
          </span>
        </Toast.Body>
      </Toast>
    </div>
  );
}

export default Tutorial;
