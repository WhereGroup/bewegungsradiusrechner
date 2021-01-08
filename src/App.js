
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MapLibreMap from './MapLibreMap';
import CookieConsent from "react-cookie-consent";


function App() {
  return (
    <div className="App">
      <CookieConsent buttonText="Okay"  buttonStyle={{ backgroundColor: "#B11E40", fontSize: "13px" }}>
        Mit diesem Tool können Sie den Bewegungsradius für eine Stadt oder eine Adresse bestimmen.
         Geben Sie dazu einfach den gewünschten Ort in das Suchfeld ein und wählen Sie einen Eintrag aus der erscheinenden Liste. 
         Mit dem Drucksymbol können Sie die aktuelle Kartenansicht als PDF herunterladen und ausdrucken.</CookieConsent>
      <MapLibreMap />


    </div>
  );
}

export default App;
