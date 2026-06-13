import { useId } from "react";

export default function Input({
  autoComplete,
  helper,
  label,
  min,
  onChange,
  placeholder = "",
  required = true,
  type = "text",
  value,
}) {
  const inputId = useId();
  const helperId = helper ? `${inputId}-helper` : undefined;

  return (
    <label htmlFor={inputId}>
      <span>{label}</span>
      <input
        aria-describedby={helperId}
        autoComplete={autoComplete}
        id={inputId}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {helper && <small id={helperId}>{helper}</small>}
    </label>
  );
}
