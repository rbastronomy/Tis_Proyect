import { useState, useEffect, useCallback } from 'react';
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
  const [selectedValue, setSelectedValue] = useState(null);
  const debouncedQuery = useDebounce(query, 1000);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const fetchSuggestions = useCallback(async (input) => {
    if (!input) return;
    try {
      setIsLoading(true);

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `address=${encodeURIComponent(input)}` +
        `&components=country:CL|administrative_area:Tarapacá|locality:Iquique|locality:Alto Hospicio` +
        `&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      if (data.status === 'OK') {
        const filteredResults = data.results.filter(item => {
          const isInTargetCity = item.address_components.some(component => {
            const name = component.long_name.toLowerCase();
            return (name === 'iquique' || name === 'alto hospicio') &&
                   (component.types.includes('locality') || 
                    component.types.includes('administrative_area_level_3'));
          });

          const isInTarapaca = item.address_components.some(component => 
            component.long_name.toLowerCase().includes('tarapacá') &&
            component.types.includes('administrative_area_level_1')
          );

          return isInTargetCity && isInTarapaca;
        });

        const formattedSuggestions = filteredResults.map(item => {
          const street = item.address_components.find(comp => comp.types.includes('route'))?.long_name || '';
          const number = item.address_components.find(comp => comp.types.includes('street_number'))?.long_name || '';
          const mainAddress = street && number ? `${street} ${number}` : item.formatted_address;

          return {
            label: mainAddress,
            fullAddress: item.formatted_address,
            value: {
              lat: item.geometry.location.lat,
              lon: item.geometry.location.lng
            },
            id: item.place_id,
          };
        });

        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }

    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, fetchSuggestions]);

  const handleSelectionChange = (key) => {
    const selected = suggestions.find(item => item.id === key);
    if (selected) {
      setSelectedValue(selected.id);
      setQuery(selected.label);
      onSelect(selected.value);
      setTimeout(() => {
        setQuery(selected.label);
      }, 0);
    }
  };

  return (
    <Autocomplete
      label="Dirección"
      placeholder="Buscar calle en Iquique o Alto Hospicio..."
      className="max-w-xs"
      items={suggestions}
      inputValue={query}
      selectedKey={selectedValue}
      defaultSelectedKey={selectedValue}
      isLoading={isLoading}
      onInputChange={(value) => {
        setQuery(value);
        if (!value) {
          setSelectedValue(null);
        }
      }}
      onSelectionChange={handleSelectionChange}
      onClear={() => {
        setQuery('');
        setSelectedValue(null);
      }}
    >
      {(item) => (
        <AutocompleteItem 
          key={item.id} 
          value={item.id}
        >
          <div className="flex flex-col">
            <span className="text-sm">{item.label}</span>
            <span className="text-xs text-gray-500">{item.fullAddress}</span>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}

AddressAutocomplete.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default AddressAutocomplete;
