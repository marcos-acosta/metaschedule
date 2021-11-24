import SectionCard from "../SectionCard/SectionCard";
import util from "./../../util";
import "./CourseCard.css";

const getCardColor = (courseGroup) => (
  util.colors[[...courseGroup.split(" ")[0]].map(char => char.charCodeAt(0)).reduce((a, b) => (a + b * 11)) % util.colors.length]
);

export default function CourseCard(props) {
  const groupInfo = util.splitCourseGroup(props.courseGroup);
  const credits = parseFloat(props.courseData.groupCredits) * (groupInfo.college === util.HARVEY_MUDD ? 1 : 3);

  return (
    <div  className={`courseCard ${getCardColor(props.courseGroup)} ${props.expanded ? 'expanded' : ''}`}
          onClick={() => props.setExpandedCourseGroup(props.expanded ? null : props.courseGroup)}>
      <div className="courseGroup">{props.courseGroup}</div>
      <div className="courseTitle">{props.courseData.groupName}</div>
      <div className="addButton">＋</div>
      <div className={`courseDetails ${props.expanded ? "" : "hidden"}`}>
        {props.expanded && 
          <>
            <h3>{props.courseData.groupName} <span className="creditText">({credits} credit{credits === 1 ? "" : "s"})</span></h3>
            <div className="descriptionContainer">
              {props.courseData.groupDescription || "No course description provided."}
            </div>
            <div className="sectionContainer">
              {
                props.courseData.sections.map(sectionCode => {
                  let sectionData = props.getFullCourseData(sectionCode);
                  // console.log(sectionData);
                  return <SectionCard section={sectionCode}
                                      seatsFilled={sectionData.courseSeatsFilled}
                                      seatsTotal={sectionData.courseSeatsTotal}
                                      professors={sectionData.courseInstructors}
                                      status={sectionData.courseEnrollmentStatus}
                                      key={sectionCode} />
                })
              }
            </div>
          </>
        }
      </div>
    </div>
  )
}