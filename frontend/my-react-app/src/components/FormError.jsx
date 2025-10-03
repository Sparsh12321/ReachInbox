// components/FormError.js
export function FormError({ message }) {
  return message ? (
    <div style={{
      padding: '12px',
      background: '#fee',
      borderRadius: '8px',
      color: '#c00',
      fontSize: '14px',
      marginBottom: '16px'
    }}>{message}</div>
  ) : null;
}