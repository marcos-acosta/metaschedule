import StatusFlag from "../StatusFlag/StatusFlag";
import "./SectionCard.css";

const formatProfs = (profs) => {
  if (profs.length === 0) {
    return "TBD";
  } else if (profs.length === 1) {
    return profs[0];
  } else {
    return profs.slice(0, -1).join(', ') + (profs.length > 2 ? ',' : '') + ' and ' + profs.at(-1);
  }
}

export default function SectionCard(props) {
  return (
    <div className="sectionCard">
      <div className="sectionTitleContainer bold">
        {props.section} ({props.seatsFilled} / {props.seatsTotal})
      </div>
      <div className="statusFlagContainer floatRight">
        <StatusFlag status={props.status} />
      </div>
      <div className="profContainer">
        Instructor{props.professors.length === 1 ? "" : "s"}: {formatProfs(props.professors)}
      </div>
    </div>
  )
}