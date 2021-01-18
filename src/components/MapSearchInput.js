import react, {useState, useRef} from "react";
import Autosuggest from "react-autosuggest";

import nmConverter from "../NominatimMap.js";
import centroid from "@turf/centroid";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import lineToPolygon from "@turf/line-to-polygon";

const MapSearchInput = (props) => {
  const locationValue = props.locationValue;
  const setLocationValue = props.setLocationValue;
  const autosuggest = useRef(null);
  
  const [suggestions, setSuggestions] = useState([]);

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
  const onChange = (event, { newValue }) => {
    setLocationValue(newValue);
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  const onSuggestionsFetchRequested = ({ value }) => {
    getSuggestions(value).then((suggestions) => {
      setSuggestions( suggestions );
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, suggestion) => {
    suggestion = suggestion.suggestion;
    this.autosuggest.current.input.blur();
    setSuggestions(suggestion);
    const data = this.getEmptyFeatureCollection();
    const sourceData = this.getEmptyFeatureCollection();
    const centroidFromSuggestion = centroid(suggestion.geojson);

    const gjson =
      suggestion.geojson === "LineString"
        ? lineToPolygon(suggestion.geojson)
        : suggestion.geojson;
    const circleFromSuggestion = buffer(gjson, 16.5, { steps: 360 });
    const origin = this.getEmptyFeature(
      suggestion.geojson.type,
      suggestion.geojson.coordinates
    );
    const bboxBuffer = bbox(circleFromSuggestion);
    data.features.push(...[circleFromSuggestion]);
    sourceData.features.push(...[origin]);

    this.map.getSource("point-radius").setData(data);
    this.map.getSource("search").setData(sourceData);

    this.map.fitBounds(bboxBuffer, { padding: 100 });
  };

  return (
    <Autosuggest
      ref={autosuggest}
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      onSuggestionSelected={onSuggestionSelected}
      renderSuggestion={renderSuggestion}
      inputProps={{
        value: (locationValue ? locationValue : ''),
        onChange: onChange, // called every time the input value changes

        type: "search",
        placeholder: "Adresse oder Stadt eingeben",
      }}
    />
  );
};

export default MapSearchInput;
