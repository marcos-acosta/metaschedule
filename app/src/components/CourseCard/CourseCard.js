import util from "./../../util";
import "./CourseCard.css";

const getCardColor = (courseGroup) => (
  util.colors[[...courseGroup.split(" ")[0]].map(char => char.charCodeAt(0)).reduce((a, b) => (a + b * 11)) % util.colors.length]
);

export default function CourseCard(props) {
  return (
    <div className={`courseCard ${getCardColor(props.courseGroup)}`}>
      <div className="courseGroup">{props.courseGroup}</div>
      <div className="courseTitle">{props.courseData.courseName}</div>
    </div>
  )
}