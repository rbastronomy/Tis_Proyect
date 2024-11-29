import { Input } from "@nextui-org/react";
import { useState } from "react";
import PropTypes from 'prop-types';

export function PasswordInput({ 
  label, 
  placeholder, 
  error, 
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Input
      {...props}
      label={label}
      placeholder={placeholder}
      endContent={
        <button 
          className="focus:outline-none" 
          type="button" 
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <i className="text-2xl text-default-400 ri-eye-off-line"/>
          ) : (
            <i className="text-2xl text-default-400 ri-eye-line"/>
          )}
        </button>
      }
      type={isVisible ? "text" : "password"}
      isInvalid={!!error}
      errorMessage={error}
      variant="bordered"
      classNames={{
        input: "bg-transparent",
        inputWrapper: "bg-white/50"
      }}
    />
  );
}

PasswordInput.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
};

PasswordInput.defaultProps = {
  label: "",
  placeholder: "",
  error: "",
}; 