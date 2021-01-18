import react, { useState, useRef } from "react";
import Autosuggest from "react-autosuggest";

import nmConverter from "../NominatimMap.js";

const MapSearchInput = (props) => {
  const locationValue = props.locationValue;
  const setLocationValue = props.setLocationValue;
  const [inputTextValue, setInputTextValue] = useState("");
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
    setLocationValue(suggestion);
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
