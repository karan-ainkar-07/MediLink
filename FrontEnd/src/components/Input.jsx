import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";

function Input({
  Label,
  Type = "text",
  Id,
  togglePassword = false,
  validate = () => ({ isValid: true, errorMessage: "" }),
  returnValue = () => {},
  IsError = () => {},
  Value
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [inputType, setInputType] = useState(Type);

  const inputRef = useRef(null);

  useEffect(() => {
    setInputType(isPasswordVisible ? "text" : Type);
  }, [isPasswordVisible, Type]);

  return (
    <div className="relative w-full min-h-[80px]">
      <input
        id={Id}
        type={inputType}
        placeholder={Label}
        value={Value}
        ref={inputRef}
        className="peer border rounded-xl w-full outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent text-base sm:text-lg h-12 sm:h-14 px-3 py-2 transition"
        onChange={(e) => {
          const inputValue = e.target.value;
          const { isValid, errorMessage } = validate(inputValue);

          setHasError(!isValid);
          setValidationMessage(errorMessage);
          IsError(prev => ({ ...prev, [Id]: !isValid }));
          returnValue(inputValue);
        }}
      />

      <label
        htmlFor={Id}
        className="absolute -top-3 left-3 bg-white px-1 text-gray-500 transition-all duration-200 cursor-text
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
          peer-focus:-top-3 peer-focus:text-sm peer-focus:text-gray-600"
        onClick={() => inputRef.current.focus()}
      >
        {Label}
      </label>

      {togglePassword && (
        isPasswordVisible ? (
          <Eye
            className="absolute top-4 right-3 h-6 w-6 cursor-pointer"
            onClick={() => setIsPasswordVisible(false)}
          />
        ) : (
          <EyeOff
            className="absolute top-4 right-3 h-6 w-6 cursor-pointer"
            onClick={() => setIsPasswordVisible(true)}
          />
        )
      )}

      <p className={`mt-1 text-sm text-red-600 ${hasError ? "opacity-100" : "opacity-0"}`}>
        {validationMessage}
      </p>
    </div>
  );
}

export default Input;
