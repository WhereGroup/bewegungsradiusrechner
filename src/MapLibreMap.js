import React from 'react';
import mapboxgl from 'maplibre-gl';
import '../node_modules/maplibre-gl/dist/mapbox-gl.css';
import Autosuggest from 'react-autosuggest';
import centroid from "@turf/centroid";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import LoadingOverlay from "react-loading-overlay"
import lineToPolygon from "@turf/line-to-polygon";
import { ReactComponent as WGLogo } from './wheregroup-logo-icon.svg';
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast"
import { BiPrinter, BiHomeHeart } from "react-icons/bi";
import { FiTwitter, FiGithub } from "react-icons/fi"
import { BsInfoCircle } from "react-icons/bs"
import { IconContext } from "react-icons";
import * as jsPDF from 'jspdf';
import { ReactComponent as Loader } from './loadingLogo.svg';
import nmConverter from "./NominatimMap.js";
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"

export default class MapLibreMap extends React.Component {
    constructor(props) {

        super(props);
        this.autosuggest = React.createRef()
        this.state = {
            lng: 8.6070,
            lat: 53.1409349,
            zoom: 8,
            map: null,
            value: '',
            selected: '',
            suggestions: [],
            showMessage: false,
            loading: false,
            showWGInfo: false
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
            style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
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


        map.on('load', async () => {

            const markerImage = await this.loadMarkerImage(process.env.PUBLIC_URL + '/marker.png');

            map.addImage("marker", markerImage)


            map.addSource("point-radius", {
                "type": "geojson",
                data: this.getEmptyFeatureCollection()

            })
            map.addSource("search", {
                "type": "geojson",
                data: this.getEmptyFeatureCollection()

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
                'type': 'symbol',
                'source': 'search',
                'filter': ['==', '$type', 'Point'],
                'icon-image': 'marker',
                'layout': {

                    'icon-image': 'marker',
                    'icon-size': 0.06,
                    "icon-allow-overlap": true,
                },
            })
        })
    }


    getSuggestions = async value => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        if (inputLength < 3) return [];
        const response = await fetch(`https://osm-search.wheregroup.com/search.php?q=${value}&polygon_geojson=1&format=json&extratags=1&accept-language=de&countrycodes=de&addressdetails=1`, { method: "GET", });
        const json = await response.json();
        const result = json.filter((e, i, l) => {

            return e.address.linked_place !== "state"
        })
        return result.slice(0, 5);

    };



    // When suggestion is clicked, Autosuggest needs to populate the input
    // based on the clicked suggestion. Teach Autosuggest how to calculate the
    // input value for every given suggestion.
    getSuggestionValue = suggestion => { return nmConverter(suggestion.address) };

    // Use your imagination to render suggestions.
    renderSuggestion = suggestion => (

        <div>
            {nmConverter(suggestion.address)}
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
            suggestions: [],

        });
    };

    onSuggestionSelected = (event, suggestion) => {
        suggestion = suggestion.suggestion
        this.autosuggest.current.input.blur()
        this.setState({ selected: suggestion })
        const data = this.getEmptyFeatureCollection();
        const sourceData = this.getEmptyFeatureCollection();;
        const centroidFromSuggestion = centroid(suggestion.geojson);

        const gjson = suggestion.geojson === "LineString" ? lineToPolygon(suggestion.geojson) : suggestion.geojson;
        const circleFromSuggestion = buffer(gjson, 16.5, { steps: 360 });
        const origin = this.getEmptyFeature(suggestion.geojson.type, suggestion.geojson.coordinates);
        const bboxBuffer = bbox(circleFromSuggestion)
        data.features.push(...[circleFromSuggestion])
        sourceData.features.push(...[origin])

        this.map.getSource("point-radius").setData(data);
        this.map.getSource("search").setData(sourceData);


        this.map.fitBounds(bboxBuffer, { padding: 100 });



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

    async loadMarkerImage(src, payload) {
        let image;

        await new Promise(async (p, r) => {


            await this.map.loadImage(
                src, async (error, img) => {
                    if (error) {
                        r();
                        throw error
                    };
                    image = img;
                    p();
                })


        })

        return image;
    }

    print = () => {
        if (!this.state.selected) {
            this.setState({
                showMessage: true

            });

            return false;
        }
        this.setState({
            loading: true

        });

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
                compress: true
            });
            Object.defineProperty(window, 'devicePixelRatio', {
                get: function () { return 300 / 96 }
            });
            const offsetX = 2.5;
            const offsetY = 2.5;
            const marginTop = 3;
            const marginBottom = 3;
            const innerMargin = 2
            const logo = "data:image/png;base64,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";
            const textBuffer = 1;
            const lineHeight = 3.25;
            const text = nmConverter(this.state.selected.address)
            const textChunksSeperator = text.split(",");
            const textChunks = [];
            textChunksSeperator.forEach((chunk) => {
                const limitChunks = chunk.match(/.{1,34}/g)
                textChunks.push(...limitChunks)
            })
            //Render map image
            pdf.addImage(renderMap.getCanvas().toDataURL('image/png'), 'png', 0, 0, 210, 297, null, 'FAST');

            //Render lower left Copyright box
            pdf.setFillColor('white')
            pdf.rect(138, 287, 297, 10, "F")
            pdf.setFontSize(10);// optional
            pdf.text("Datenquelle: © OpenStreetMap-Mitwirkende", 140, pdf.internal.pageSize.height - 3)

            //Render infobox
            pdf.setFillColor('white')
            const infoBoxSize = (textChunks.length * lineHeight) + marginTop + marginBottom + (lineHeight * 2) + innerMargin * 2 + textBuffer

            pdf.rect(offsetX, 2, 66.5, infoBoxSize, "F")

            pdf.setFontSize(10);
            pdf.text("Bewegungsradiusrechner (15km) für:", 6, offsetY + marginTop)

            //Render inner infobox
            pdf.rect(6, 7, 60, textChunks.length * lineHeight + innerMargin * 2 + textBuffer)
            pdf.setFontSize(10);

            //Write out address
            textChunks.forEach((text, i) => {
                pdf.text(text.trim(), 8, 10 + (i * 3.5) + innerMargin)
            })

            //Add WG Logo
            pdf.addImage(logo, 'png', 5, (offsetY + marginTop + lineHeight * 2) + (textChunks.length * 3) + innerMargin * 2, 3, 3, null, 'FAST');

            //Add WG Url
            pdf.setFontSize(10);
            pdf.text("wheregroup.com", 40, (offsetY + marginTop + lineHeight * 2) + (textChunks.length * lineHeight) + innerMargin * 2 + textBuffer)

            //Set pdfs props
            pdf.setProperties({
                title: "covid19 Bewegungsradiusrechner (15km) ",
                subject: "covid19 Bewegungsradiusrechner (15km)",
                creator: 'WhereGroup GmbH',
                author: '(c)WhereGroup GmbH, (c)OpenStreetMap'
            })
            console.log(pdf.getFontList())
            pdf.save('Bewegungsradiusrechner.pdf');


            renderMap.remove();
            hidden.parentNode?.removeChild(hidden);
            Object.defineProperty(window, 'devicePixelRatio', {
                get: function () { return actualPixelRatio }
            });
            this.setState({
                loading: false

            });
        }.bind(this));
    }

    toPixels(length) {
        let conversionFactor = 96;

        conversionFactor /= 25.4;

        return conversionFactor * length + 'px';
    }


    toggleInfo = () => {
        this.setState(prevState => ({ showTutorial: !prevState.showTutorial }))
    }
    toggleWGInfo = () => {
        this.setState(prevState => ({ showWGInfo: !prevState.showWGInfo }))
    }

    render() {

        const Message = () => (
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    float: "right",
                    margin: "auto",
                    zIndex: 2,
                }}
            >
                <Toast onClose={() => this.setState({ showMessage: false })} show={this.state.showMessage} delay={3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Hinweis</strong>
                    </Toast.Header>
                    <Toast.Body>Bitte suchen Sie zuerst nach einem Ort oder einer Adresse.</Toast.Body>
                </Toast>

            </div>
        )


        const Tutorial = () => (
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    zIndex: 2,
                    margin: "auto"


                }}
            >
                <Toast onClose={() => this.setState({ showTutorial: false })} show={this.state.showTutorial} >
                    <Toast.Header>
                        <strong className="mr-auto">Information</strong>
                    </Toast.Header>
                    <Toast.Body>
                        <span>
                            Bundesländer und Kommunen setzen die <strong>15-Kilometer-Radius-Regel</strong> unterschiedlich um.
                         Bitte informieren Sie sich bei der für Ihren Wohnort zuständigen Behörde. </span>
                        <hr /><span>
                            Mit diesem Tool können Sie den Bewegungsradius für eine Stadt oder eine Adresse bestimmen.
                            Geben Sie dazu einfach den gewünschten Ort in das Suchfeld ein und wählen Sie einen Eintrag aus der erscheinenden Liste.
         Mit dem Drucksymbol können Sie die aktuelle Kartenansicht als PDF herunterladen und ausdrucken. </span></Toast.Body>
                </Toast>

            </div>
        )




        const inputProps = {
            value: this.state.value, // usually comes from the application state
            onChange: this.onChange, // called every time the input value changes

            type: "search",
            placeholder: "Adresse oder Stadt eingeben"
        };



        const WGInfo = () => (
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    zIndex: 2,
                    margin: "auto"


                }}
            >
                <Toast onClose={() => this.setState({ showWGInfo: false })} show={this.state.showWGInfo}  >
                    <Toast.Header as="h3">made by  WhereGroup GmbH </Toast.Header>
                    <Toast.Body>
                        find us here: <br />
                        <IconContext.Provider value={{ color: "black", size: "2em", className: "whereToFind" }}>
                            <a href="https://wheregroup.com/" target="_blank"><BiHomeHeart value={{ size: "2em" }} /></a>
                            <a href="https://github.com/WhereGroup" target="_blank"><FiGithub /></a>
                            <a href="https://twitter.com/WhereGroup_com/" target="_blank"><FiTwitter /></a>
                        </IconContext.Provider>
                    </Toast.Body>
                </Toast>

            </div>
        );



        return (<div>

            <LoadingOverlay
                active={this.state.loading}
                spinner={<Loader width="20%" />}
                text="Erzeuge Pdf"
            >  <Tutorial />
                <Message />
                <  WGInfo />

                <div className="overlay">

                    <Nav as="ul" className="glass">
                        <Nav.Item className="navbtn" as="li">
                            <Navbar.Text >   <   WGLogo width="16px" /> Bewegungsradiusrechner</Navbar.Text>

                        </Nav.Item>
                        <Nav.Item className="autosuggest-container-nav" as="li">
                            <Autosuggest ref={this.autosuggest}
                                suggestions={this.state.suggestions}
                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                getSuggestionValue={this.getSuggestionValue}
                                onSuggestionSelected={this.onSuggestionSelected}
                                renderSuggestion={this.renderSuggestion}
                                inputProps={inputProps}
                            />
                        </Nav.Item>
                        <Nav.Item className="navbtn" as="li">
                            <Button variant="light" onClick={this.print} ><BiPrinter></BiPrinter></Button>
                        </Nav.Item>
                        <Nav.Item className="navbtn" as="li">
                            <Button variant="light" onClick={this.toggleWGInfo}><WGLogo width="16px" /></Button>

                        </Nav.Item>
                        <Nav.Item className="navbtn" as="li">
                            <Button variant="light" onClick={this.toggleInfo} > <BsInfoCircle /></Button>

                        </Nav.Item>

                    </Nav >
                </div>

                <div ref={el => this.mapContainer = el} className="mapContainer" />
            </LoadingOverlay >
        </div >)
    }
}

