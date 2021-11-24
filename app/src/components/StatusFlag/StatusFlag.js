import "./StatusFlag.css";

export default function StatusFlag(props) {
  const {status, ...rest} = props;

  return <div className={`statusFlag ${status}`} {...rest}>
    {props.status.toUpperCase()}
  </div>
}