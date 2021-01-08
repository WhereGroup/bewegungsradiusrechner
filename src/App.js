
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MapLibreMap from './MapLibreMap';
//import CookieConsent from "react-cookie-consent";

/**    <CookieConsent>Diese Website verwendet Cookies – nähere Informationen dazu und zu Ihren Rechten als Benutzer finden Sie in unserer <a href="https://wheregroup.com/datenschutz/" target="_blank">  Datenschutzerklärung </a>Klicken Sie auf
         „Ich stimme zu“, um Cookies zu akzeptieren und direkt unsere Website besuchen zu können.</CookieConsent> */
function App() {
  return (
    <div className="App">
      <MapLibreMap />


    </div>
  );
}

export default App;
