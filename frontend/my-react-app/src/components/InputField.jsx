export function InputField({ label, type, id, name, value, onChange, error, placeholder, autoComplete }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={error ? 'error' : ''}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}