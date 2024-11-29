import { useState, useCallback } from 'react';
import { checkRut, formatRut, prettifyRut } from "react-rut-formatter";

/**
 * Custom hook for handling Chilean RUT validation and formatting
 * @returns {Object} Object containing rut value, update function and validation state
 * @property {Object} rut - Contains formatted and raw RUT values
 * @property {Function} updateRut - Function to update RUT value
 * @property {boolean} isValid - Whether the current RUT is valid
 */
export function useRut() {
  const [rutValue, setRutValue] = useState({ formatted: '', raw: '' });
  const [isValid, setIsValid] = useState(false);

  const updateRut = useCallback((value) => {
    const formatted = prettifyRut(value);
    const raw = formatRut(value);
    const valid = checkRut(value);
    
    setRutValue({ formatted, raw });
    setIsValid(valid);
  }, []);

  return {
    rut: rutValue,
    updateRut,
    isValid
  };
} 