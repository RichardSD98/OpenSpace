export default function PhoneInput({ value = '', onChange, required, placeholder = '81 000 0000' }) {
  // Strip +264 or 264 prefix (and leading 0) to get the editable local part
  const local = value.replace(/^\+264/, '').replace(/^264/, '').replace(/^0/, '')

  const handleChange = (e) => {
    const raw = e.target.value.replace(/^\+264/, '').replace(/^264/, '').replace(/^0/, '')
    onChange('+264' + raw)
  }

  return (
    <div className="phone-wrap">
      <div className="phone-prefix">
        <span className="phone-flag">🇳🇦</span>
        <span className="phone-code">+264</span>
      </div>
      <span className="phone-divider" />
      <input
        type="tel"
        className="phone-local"
        placeholder={placeholder}
        value={local}
        onChange={handleChange}
        required={required}
      />
    </div>
  )
}
