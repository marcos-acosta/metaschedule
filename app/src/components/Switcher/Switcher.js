import "./Switcher.css";

export default function Switcher(props) {
  const { options, value, onChange, ...rest } = props;
  
  return (
    <div {...rest}>
      {
        options.map((option, i) =>
          <button key={i} 
                  onClick={() => onChange(i)} 
                  className={`switcherButton ${value === i ? "selected" : ""} ${!i ? "firstOption" : ""} ${i === options.length - 1 ? "lastOption" : ""}`}>
            {option}
          </button>  
        )
      }
    </div>
  )
}