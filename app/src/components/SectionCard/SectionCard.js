import StatusFlag from "../StatusFlag/StatusFlag";
import util from "../../util";
import "./SectionCard.css";

const formatProfs = (profs) => {
  if (!profs.length || !profs[0].trim()) {
    return "Instructors TBD";
  } else if (profs.length === 1) {
    return `Taught by ${profs[0]}`;
  } else {
    return `Taught by ${profs.slice(0, -1).join(', ')}${(profs.length > 2 ? ',' : '')} and ${profs.at(-1)}`;
  }
}

const formatPercentFilled = (filled, total) => (
  `${Math.trunc(filled * 100 / total)}% filled`
)

const formatMeeting = (meeting) => (
  `${meeting.scheduleDays} ${util.militaryToAMPM(meeting.scheduleStartTime)} – ${util.militaryToAMPM(meeting.scheduleEndTime)} at ${meeting.scheduleLocation}`
)

export default function SectionCard(props) {
  return (
    <div className="sectionCard">
      <div className="percentFilled">
        {formatPercentFilled(props.seatsFilled, props.seatsTotal)}
      </div>
      <div className="statusFlagContainer floatRight">
        <StatusFlag status={props.status} />
      </div>
      <div className="sectionTitleContainer bold">
        {props.section} ({props.seatsFilled} / {props.seatsTotal})
      </div>
      <div className="profContainer">
        {formatProfs(props.professors)}
      </div>
      <hr />
      <div>
        {
          props.schedule.map((meeting, i) => <div key={i}>{formatMeeting(meeting)}</div>)
        }
      </div>
    </div>
  )
}