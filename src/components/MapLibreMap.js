import React from "react";
import mapboxgl from "maplibre-gl";
import "maplibre-gl/dist/mapbox-gl.css";

export default class MapLibreMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: 8.607,
      lat: 53.1409349,
      zoom: 10,
      map: null,
      value: "",
      selected: "",
      suggestions: [],
      showMessage: false,
      loading: false,
      showWGInfo: false,
    };
  }

  componentDidMount() {
    const blank = {
      version: 8,
      name: "Blank",
      center: [0, 0],
      zoom: 0,
      sources: {},
      //"sprite": window.location.origin + process.env.PUBLIC_URL + "/sprites/osm-liberty",
      glyphs: "mapbox://fonts/openmaptiles/{fontstack}/{range}.pbf",
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": "rgba(255,255,255,1)" },
        },
      ],
      id: "blank",
    };

    const maxBounds = [
      [1.40625, 43.452919],
      [17.797852, 55.973798],
    ];

    const map = (this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
      maxBounds: maxBounds,
    }));

    map.on("move", () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
    });

    map.on("load", async () => {
      const markerImage = await this.loadMarkerImage(
        process.env.PUBLIC_URL + "/marker.png"
      );
      const syringeImage = await this.loadMarkerImage(
        process.env.PUBLIC_URL + "/syringe.png"
      );

      map.addImage("marker", markerImage);
      map.addImage("syringe", syringeImage);

      this.getVacCenters();
      navigator.geolocation.getCurrentPosition((position) => {
        this.setCenterToLongLat(
          position.coords.longitude,
          position.coords.latitude
        );
      });

      map.addSource("point-radius", {
        type: "geojson",
        data: this.getEmptyFeatureCollection(),
      });
      map.addSource("search", {
        type: "geojson",
        data: this.getEmptyFeatureCollection(),
      });

      map.addLayer({
        id: "fill-radius-layer",
        type: "fill",
        source: "point-radius",
        paint: {
          "fill-color": "#007cbf",
          "fill-opacity": 0.5,
        },
      });
      map.addLayer({
        id: "search-fill-layer",
        type: "fill",
        source: "search",
        paint: {
          "fill-color": "red",
          "fill-opacity": 0.5,
        },
      });
      map.addLayer({
        id: "search-point",
        type: "symbol",
        source: "search",
        filter: ["==", "$type", "Point"],
        "icon-image": "marker",
        layout: {
          "icon-image": "marker",
          "icon-size": 0.06,
          "icon-allow-overlap": true,
        },
      });
    });
  }

  setCenterToLongLat = (longitude, latitude) => {
    this.map.flyTo({
      center: [longitude, latitude],
    });
  };

  getEmptyFeatureCollection() {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }
  getEmptyFeature(type, coordinates) {
    return {
      type: "Feature",
      geometry: {
        type: type,
        coordinates: coordinates,
      },
      properties: {
        name: null,
      },
    };
  }

  async loadMarkerImage(src) {
    let image;

    await new Promise(async (p, r) => {
      await this.map.loadImage(src, async (error, img) => {
        if (error) {
          r();
          throw error;
        }
        image = img;
        p();
      });
    });

    return image;
  }

  getVacCenters = () => {
    fetch("./vaccination.json")
      .then((response) => response.json())
      .then((response) => {
        const featureCollection = this.getEmptyFeatureCollection();

        response.elements.forEach((e, i, l) => {
          const feature = this.getEmptyFeature("Point", [e.lon, e.lat]);
          Object.assign(feature.properties, e.tags);
          featureCollection.features.push(feature);
        });

        this.map.addSource("vaccination", {
          type: "geojson",
          data: featureCollection,
        });

        this.map.addLayer({
          id: "vaccination-point",
          type: "symbol",
          source: "vaccination",

          "icon-image": "marker",
          layout: {
            "icon-image": "syringe",
            "icon-size": 0.06,
            "icon-allow-overlap": true,
          },
        });

        this.map.addLayer({
          id: "vaccination-label",
          type: "symbol",
          source: "vaccination",
          type: "symbol",
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Regular"],
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-radial-offset": 0.5,
            //'text-justify': 'auto',
            //'text-allow-overlap': true
          },
        });
      });
  };
  render() {
    return (
      <div ref={(el) => (this.mapContainer = el)} className="mapContainer" />
    );
  }
}
