import react, { useState, useEffect, useRef, useContext } from "react";
import MapContext from "../mapcomponents/MapContext";

import Autosuggest from "react-autosuggest";

import centroid from "@turf/centroid";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import lineToPolygon from "@turf/line-to-polygon";
import nmConverter from "./MapLibreMap/nominatimMap.js";

const MapSearchInput = (props) => {
  const [inputTextValue, setInputTextValue] = useState("");
  const autosuggest = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [mapLocation, setMapLocation] = useState(null);

  const mapContext = useContext( MapContext );
  const map = mapContext.map;

  useEffect(() => {
    console.log(mapContext);
  }, [map]);

  useEffect(() => {
    if (
      map &&
      mapLocation &&
      typeof mapLocation.geojson !== "undefined"
    ) {
      const data = getEmptyFeatureCollection();
      const sourceData = getEmptyFeatureCollection();

      const gjson =
        mapLocation.geojson === "LineString"
          ? lineToPolygon(mapLocation.geojson)
          : mapLocation.geojson;
      const circleFromSuggestion = buffer(gjson, 16.5, { steps: 360 });
      const origin = getEmptyFeature(
        mapLocation.geojson.type,
        mapLocation.geojson.coordinates
      );

      const bboxBuffer = bbox(circleFromSuggestion);
      data.features.push(...[circleFromSuggestion]);
      sourceData.features.push(...[origin]);

      if (
        typeof map.getSource("point-radius") !== "undefined" &&
        typeof map.getSource("search") !== "undefined"
      ) {
        map.getSource("point-radius").setData(data);
        map.getSource("search").setData(sourceData);
      }

      map.fitBounds(bboxBuffer, { padding: 100 });
    }
  }, [mapLocation, map]);

  const getEmptyFeatureCollection = () => {
    return {
      type: "FeatureCollection",
      features: [],
    };
  };
  const getEmptyFeature = (type, coordinates) => {
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
  };


  const getSuggestions = async (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    if (inputLength < 3) return [];
    const response = await fetch(
      `https://osm-search.wheregroup.com/search.php?q=${value}&polygon_geojson=1&format=json&extratags=1&accept-language=de&countrycodes=de&addressdetails=1`,
      { method: "GET" }
    );
    const json = await response.json();
    const result = json.filter((e, i, l) => {
      return e.address.linked_place !== "state";
    });
    return result.slice(0, 5);
  };

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  const getSuggestionValue = (suggestion) => {
    return nmConverter(suggestion.address);
  };

  // Use your imagination to render suggestions.
  const renderSuggestion = (suggestion) => (
    <div>{nmConverter(suggestion.address)}</div>
  );
  const onChangeInput = (event, { newValue }) => {
    setInputTextValue(newValue);
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  const onSuggestionsFetchRequested = ({ value }) => {
    getSuggestions(value).then((suggestions) => {
      setSuggestions(suggestions);
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, suggestion) => {
    suggestion = suggestion.suggestion;
    autosuggest.current.input.blur();
    setMapLocation(suggestion);
  };

  return (
    <Autosuggest
      ref={autosuggest}
      suggestions={suggestions}
      highlightFirstSuggestion={true}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      onSuggestionSelected={onSuggestionSelected}
      renderSuggestion={renderSuggestion}
      inputProps={{
        value: inputTextValue,
        onChange: onChangeInput,
        type: "search",
        placeholder: "Adresse oder Stadt eingeben",
      }}
    />
  );
};

export default MapSearchInput;
