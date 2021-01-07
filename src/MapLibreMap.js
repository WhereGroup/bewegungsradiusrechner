import React from 'react';
import mapboxgl from 'maplibre-gl';
import '../node_modules/maplibre-gl/dist/mapbox-gl.css';
import germany from './germany';
import Autosuggest from 'react-autosuggest';
import circle from "@turf/circle";
import centroid from "@turf/centroid";
import buffer from "@turf/buffer";
import lineToPolygon from "@turf/line-to-polygon";






export default class MapLibreMap extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            lng: 8.6070,
            lat: 53.1409349,
            zoom: 8,
            map: null,
            value: '',
            suggestions: []
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
                zoom: map.getZoom().toFixed(2)
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
            map.addSource("germany", {
                "type": "geojson",
                "data": germany
            })

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
                'id': 'germany-layer',
                'type': 'line',
                'source': 'germany', 'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },

                'paint': {
                    'line-color': 'red',
                    'line-opacity': 1,
                    'line-width': 2,

                }
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
                    'circle-radius' : 2,
                },
            })
        })
    }


    getSuggestions = async value => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        const languages = [];
        if(inputLength < 3) return [];
        const response = await fetch(`http://osm-search.wheregroup.com/search.php?q=${value}&polygon_geojson=1&format=json`, { method: "GET", });
        const json = await  response.json();
        return json;
        
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
    onSuggestionsFetchRequested =  ({ value }) => {
        this.getSuggestions(value).then( suggestions => {
            this.setState({
                suggestions:  suggestions
            });
        })
       
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    onSuggestionSelected = (event, suggestion)=>{
        suggestion = suggestion.suggestion
        const data = this.getEmptyFeatureCollection();
        const sourceData = this.getEmptyFeatureCollection(); ;
        const centroidFromSuggestion =  centroid(suggestion.geojson);
        
        const gjson = suggestion.geojson === "LineString" ? lineToPolygon(suggestion.geojson) : suggestion.geojson;
        const circleFromSuggestion = buffer(gjson, 15,{steps : 36000});
        const origin = this.getEmptyFeature(suggestion.geojson.type,suggestion.geojson.coordinates);
        
        data.features.push(...[circleFromSuggestion])
        sourceData.features.push(...[origin])
       
        this.map.getSource("point-radius").setData(data);
        this.map.getSource("search").setData(sourceData);
        this.map.flyTo({ center: centroidFromSuggestion.geometry.coordinates,essential: true } );
    }

    getEmptyFeatureCollection() {
        return {
            "type": "FeatureCollection",
            "features": []
        }
    }
    getEmptyFeature(type,coordinates) {
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

    render() {
        const inputProps = {
            value: this.state.value, // usually comes from the application state
            onChange: this.onChange, // called every time the input value changes

            type: "search",
            placeholder: "Enter city or postcode"
        };
        return (<div>
            <div className="overlay">
                <Autosuggest
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    onSuggestionSelected={this.onSuggestionSelected}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps}
                />
            </div>


            <div ref={el => this.mapContainer = el} className="mapContainer" />

        </div >)
    }
}

