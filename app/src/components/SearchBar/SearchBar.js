export default function SearchBar(props) {
  const { value, onChange, ...rest } = props;

  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  )
}