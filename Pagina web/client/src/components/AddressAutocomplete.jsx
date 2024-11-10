import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

function AddressAutocomplete({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 1000);

  const fetchSuggestions = async (input) => {
    if (!input) return;
    try {
      setIsLoading(true);
      
      // Split input into street name and number
      const parts = input.split(/\s+/);
      const hasNumber = /\d/.test(input);
      let streetName, streetNumber;
      
      if (hasNumber) {
        // Find where the number starts
        const numberIndex = parts.findIndex(part => /\d/.test(part));
        streetName = parts.slice(0, numberIndex).join(' ');
        streetNumber = parts.slice(numberIndex).join(' ');
      } else {
        streetName = input;
      }

      // First, get the street coordinates
      const params = new URLSearchParams({
        format: 'json',
        q: `${streetName}, Iquique, Chile`,
        countrycodes: 'cl',
        addressdetails: 1,
        limit: 5,
        bounded: 1,
        viewbox: '-70.3,-20.1,-70.0,-20.3',
        dedupe: 1,
        'accept-language': 'es'
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            'User-Agent': 'TaxiAeropuertoTarapaca/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      // Filter and process the results
      const filteredData = data.filter(item => {
        const inIquique = item.display_name.toLowerCase().includes('iquique');
        const inAltoHospicio = item.display_name.toLowerCase().includes('alto hospicio');
        return (inIquique || inAltoHospicio);
      });

      // If we have a street number, interpolate the position
      if (hasNumber && filteredData.length > 0) {
        const street = filteredData[0];
        const bbox = street.boundingbox;
        
        // Calculate approximate position based on street number
        // Assuming street numbers increase linearly along the street
        const startLat = parseFloat(bbox[0]);
        const endLat = parseFloat(bbox[1]);
        const startLon = parseFloat(bbox[2]);
        const endLon = parseFloat(bbox[3]);
        
        // Simple linear interpolation - can be improved with actual street number ranges
        const numberPercent = parseInt(streetNumber) / 2000; // Assuming max number is 2000
        const interpolatedLat = startLat + (endLat - startLat) * numberPercent;
        const interpolatedLon = startLon + (endLon - startLon) * numberPercent;

        setSuggestions([{
          label: `${streetName} ${streetNumber}`,
          fullAddress: `${streetName} ${streetNumber}, ${street.address.city}`,
          value: { 
            lat: interpolatedLat,
            lon: interpolatedLon
          },
          id: `${street.place_id}-${streetNumber}`
        }]);
      } else {
        // No street number, return the streets
        setSuggestions(filteredData.map(item => ({
          label: item.address.road || item.name,
          fullAddress: item.display_name,
          value: { 
            lat: parseFloat(item.lat), 
            lon: parseFloat(item.lon) 
          },
          id: item.place_id,
        })));
      }

    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const handleSelectionChange = (key) => {
    const selected = suggestions.find(item => item.id.toString() === key);
    if (selected) {
      setQuery(selected.label);
      onSelect(selected.value);
      console.log('Selected address:', selected.label);
    }
  };

  return (
    <Autocomplete
      label="Dirección"
      placeholder="Buscar calle en Iquique o Alto Hospicio..."
      className="max-w-xs"
      defaultItems={suggestions}
      inputValue={query}
      isLoading={isLoading}
      onInputChange={setQuery}
      onSelectionChange={handleSelectionChange}
    >
      {(item) => (
        <AutocompleteItem 
          key={item.id.toString()} 
          textValue={item.label}
          title={item.label}
          description={item.fullAddress}
        >
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}

AddressAutocomplete.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default AddressAutocomplete; 