import React from 'react';
import mapboxgl from 'maplibre-gl';
import '../node_modules/maplibre-gl/dist/mapbox-gl.css';
import germany from './germany';
import Autosuggest from 'react-autosuggest';
import centroid from "@turf/centroid";
import buffer from "@turf/buffer";
import lineToPolygon from "@turf/line-to-polygon";
import { ReactComponent as WGLogo } from './wheregroup-logo-icon.svg';
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Button from "react-bootstrap/Button";
import Navbar  from "react-bootstrap/Navbar"
import Toast from "react-bootstrap/Toast"
import { BiPrinter, BiHomeHeart } from "react-icons/bi";
import { FiTwitter, FiGithub } from "react-icons/fi"
import { IconContext } from "react-icons";
import * as jsPDF from 'jspdf';



export default class MapLibreMap extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            lng: 8.6070,
            lat: 53.1409349,
            zoom: 8,
            map: null,
            value: '',
            suggestions: [],
            showMessage: false
        };
    }

    componentDidMount() {





        const blank = {
            "version": 8,
            "name": "Blank",
            "center": [0, 0],
            "zoom": 0,
            "sources": {},
            //"sprite": window.location.origin + process.env.PUBLIC_URL + "/sprites/osm-liberty",
            "glyphs": "mapbox://fonts/openmaptiles/{fontstack}/{range}.pbf",
            "layers": [{
                "id": "background",
                "type": "background",
                "paint": { "background-color": "rgba(255,255,255,1)" }
            }],
            "id": "blank"
        }



        const maxBounds = [[1.406250, 43.452919], [17.797852, 55.973798]]


        const map = this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: blank,
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom,
            maxBounds: maxBounds
        });


        map.on('move', () => {


            this.setState({
                lng: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2),
            
            });

        });


        map.on('load', () => {
            map.addSource("wms-osm-source", {
                "id": "wms-osm-source",
                "type": "raster",
                "tiles": [
                    'https://osm-demo.wheregroup.com/service?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&STYLES=&request=GetMap&srs=EPSG:3857&transparent=false&width=256&height=256&layers=osm&tiled=true'
                ],

                "tileSize": 256
            });
         

            map.addSource("point-radius", {
                "type": "geojson",
                data: this.getEmptyFeatureCollection()

            })
            map.addSource("search", {
                "type": "geojson",
                data: this.getEmptyFeatureCollection()

            })

            map.addLayer({
                'id': 'wms-test-layer',
                'type': 'raster',
                'source': 'wms-osm-source',
                'paint': {},
                'layout': {
                    'visibility': 'visible',
                },
            })

           
            map.addLayer({
                'id': 'fill-radius-layer',
                'type': 'fill',
                'source': 'point-radius',
                'paint': {

                    'fill-color': '#007cbf',
                    'fill-opacity': 0.5
                },
            })
            map.addLayer({
                'id': 'search-fill-layer',
                'type': 'fill',
                'source': 'search',
                'paint': {

                    'fill-color': 'red',
                    'fill-opacity': 0.5
                },
            })
            map.addLayer({
                'id': 'search-point',
                'type': 'circle',
                'source': 'search',
                'filter': ['==', '$type', 'Point'],
                'paint': {

                    'circle-color': 'red',
                    'circle-opacity': 0.5,
                    'circle-radius': 2,
                },
            })
        })
    }


    getSuggestions = async value => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        const languages = [];
        if (inputLength < 3) return [];
        const response = await fetch(`https://osm-search.wheregroup.com/search.php?q=${value}&polygon_geojson=1&format=json&extratags=1`, { method: "GET", });
        const json = await response.json();
        const result = json.filter((e,i,l)=>{
            return e.extratags.linked_place !== "state"
        })
        return result.slice(0,5);

    };

    // When suggestion is clicked, Autosuggest needs to populate the input
    // based on the clicked suggestion. Teach Autosuggest how to calculate the
    // input value for every given suggestion.
    getSuggestionValue = suggestion => suggestion.display_name;

    // Use your imagination to render suggestions.
    renderSuggestion = suggestion => (
        <div>
            {suggestion.display_name}
        </div>
    );
    onChange = (event, { newValue }) => {
        this.setState({
            value: newValue
        });
    };

    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    onSuggestionsFetchRequested = ({ value }) => {
        this.getSuggestions(value).then(suggestions => {
            this.setState({
                suggestions: suggestions
            });
        })

    };

    // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    onSuggestionSelected = (event, suggestion) => {
        suggestion = suggestion.suggestion
        this.setState({selected : suggestion.display_name90  })
        const data = this.getEmptyFeatureCollection();
        const sourceData = this.getEmptyFeatureCollection();;
        const centroidFromSuggestion = centroid(suggestion.geojson);

        const gjson = suggestion.geojson === "LineString" ? lineToPolygon(suggestion.geojson) : suggestion.geojson;
        const circleFromSuggestion = buffer(gjson, 15, { steps: 36000 });
        const origin = this.getEmptyFeature(suggestion.geojson.type, suggestion.geojson.coordinates);

        data.features.push(...[circleFromSuggestion])
        sourceData.features.push(...[origin])

        this.map.getSource("point-radius").setData(data);
        this.map.getSource("search").setData(sourceData);
        this.map.flyTo({ center: centroidFromSuggestion.geometry.coordinates, essential: true });
      
    }

    getEmptyFeatureCollection() {
        return {
            "type": "FeatureCollection",
            "features": []
        }
    }
    getEmptyFeature(type, coordinates) {
        return {
            "type": "Feature",
            "geometry": {
                "type": type,
                "coordinates": coordinates
            },
            "properties": {
                "name": null
            }
        }

    }

    print = () => {
        if (!this.state.value) {
            this.setState({
               showMessage: true
            
            });

            return false;
        }
        const width = 210
        const height = 297
        // Calculate pixel ratio
        const actualPixelRatio = window.devicePixelRatio;

        // Create map container
        const hidden = document.createElement('div');
        hidden.className = 'hidden-map';
        document.body.appendChild(hidden);
        const container = document.createElement('div');
        container.style.width = this.toPixels(width);
        container.style.height = this.toPixels(height);
        hidden.appendChild(container);

        //Render map
        var renderMap = new mapboxgl.Map({
            container: container,
            center: this.map.getCenter(),
            zoom: this.map.getZoom(),
            bearing: this.map.getBearing(),
            pitch: this.map.getPitch(),
            interactive: false,
            preserveDrawingBuffer: true,
            fadeDuration: 0,
            attributionControl: false
        });
        let style = this.map.getStyle();
        for (let name in style.sources) {
            let src = style.sources[name];
            Object.keys(src).forEach(key => {
                //delete properties if value is undefined.
                // for instance, raster-dem might has undefined value in "url" and "bounds"
                if (!src[key]) {
                    delete src[key];
                }
            })
        }
        renderMap.setStyle(style)

        renderMap.once('idle', function () {

            // TO DO: It is still under development
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                // format: [this_.width, this_.height],
                compress: true
            });
            Object.defineProperty(window, 'devicePixelRatio', {
                get: function () { return 300 / 96 }
            });
            const offsetX = 3;
            const offsetY = 3;
            pdf.addImage(renderMap.getCanvas().toDataURL('image/png'), 'png', 0, 0, 210, 297, null, 'FAST');
            pdf.setFillColor('white')
            pdf.rect(138, 287, 297, 10, "F")
            pdf.setFontSize(10);// optional
            pdf.text("Datenquelle: © OpenStreetMap-Mitwirkende", 140, pdf.internal.pageSize.height - 3)
            pdf.setFillColor('white')
            pdf.rect(3, 3, 70, 13, "F")
            pdf.setFontSize(10);// optional
            pdf.text("covid19 Bewegungsradiusrechner (15km) ", 5, 6)
            pdf.setFontSize(10);// optional
            pdf.text(this.state.value.slice(0, 34), 5, 10)
            pdf.setFontSize(10);// optional
            pdf.text("made by wheregroup", 5, 14)
            pdf.setProperties({
                title: "covid19 Bewegungsradiusrechner (15km) ",
                subject: "covid19 Bewegungsradiusrechner (15km)",
                creator: 'WhereGroup GmBh',
                author: '(c)Mapbox, (c)OpenStreetMap'
            })
            console.log(pdf.getFontList())
            pdf.save('Bewegungsradiusrechner.pdf');


            renderMap.remove();
            hidden.parentNode?.removeChild(hidden);
            Object.defineProperty(window, 'devicePixelRatio', {
                get: function () { return actualPixelRatio }
            });
        }.bind(this));
    }

    toPixels(length) {
        let conversionFactor = 96;

        conversionFactor /= 25.4;

        return conversionFactor * length + 'px';
    }

    render() {

      const Message =  () =>( 
            <div
                style={{
                    position: 'relative',
                    top: 0,
                    right: 0,
                    float: "right",
                    "padding-right": "3rem"
                }}
            >
                <Toast onClose={() => this.setState({showMessage : false})} show={this.state.showMessage} delay={3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Hinweis</strong>
                    </Toast.Header>
                    <Toast.Body>Bitte suchen Sie zuerst nach einem Ort oder einer Adresse.</Toast.Body>
                </Toast>
               
            </div>
    )


        const inputProps = {
            value: this.state.value, // usually comes from the application state
            onChange: this.onChange, // called every time the input value changes

            type: "search",
            placeholder: "Adresse oder Stadt eingeben"
        };

        const popover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">made by <span>WhereGroup GmbH </span> </Popover.Title>
                <Popover.Content>
                    find us here: <br />
                    <IconContext.Provider value={{ color: "black", size: "2em", className: "whereToFind" }}>
                        <a href="https://wheregroup.com/" target="_blank"><BiHomeHeart value={{ size: "2em" }} /></a>
                        <a href="https://github.com/WhereGroup" target="_blank"><FiGithub /></a>
                        <a href="https://twitter.com/WhereGroup_com/" target="_blank"><FiTwitter /></a>
                    </IconContext.Provider>
                </Popover.Content>
            </Popover>
        );

        const Info = () => (
            <OverlayTrigger trigger="click" placement="right" overlay={popover}>
                <Button variant="light"><WGLogo width="1rem" /></Button>
            </OverlayTrigger>
        );

        return (<div>
          
            <Navbar  className="overlay navbar">
            <Message   />
                <Autosuggest
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    onSuggestionSelected={this.onSuggestionSelected}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps}
                />
                <Button variant="light" onClick={this.print} ><BiPrinter></BiPrinter></Button>
                <Info />


            </Navbar >

            <div className="footer"> <a href="https://www.openstreetmap.org/copyright" target="_blank"> © OpenStreetmap-Mitwirkende  </a> | <a href="https://wheregroup.com/impressum/" target="_blank"> Impressum </a> | <a href="https://wheregroup.com/datenschutz/" target="_blank">  Datenschutzerklärung </a>    </div>

            <div ref={el => this.mapContainer = el} className="mapContainer" />

        </div >)
    }
}

