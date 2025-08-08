import React from "react";

function TextField({
  label = "",
  value = "",
  onChange = () => {},
  type = "text",
  placeholder = "",
  name = "",
  required = false,
  disabled = false,
  error = false,
  errorMessage = "",
  enableValidation = false,
  style = {},
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          padding: "8px 12px",
          borderRadius: "4px",
          border: "1px solid",
          borderColor: enableValidation && error ? "red" : "#ccc",
          width: "100%",
          boxSizing: "border-box",
          ...style, // ✅ รองรับการ custom style เพิ่มได้
        }}
      />
      {enableValidation && error && (
        <div style={{ color: "red", fontSize: "0.85rem", marginTop: "4px" }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default TextField;
