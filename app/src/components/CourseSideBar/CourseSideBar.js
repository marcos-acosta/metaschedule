import util from "../../util";
import CourseCard from "../CourseCard/CourseCard";
import "./CourseSideBar.css";

export default function CourseSideBar(props) {
  const totalCredits = props.selectedGroups.map(groupObj => groupObj.credits).reduce((a, b) => a + b, 0);

  return (
    <div className="courseSidebar">
      <h2 className="sidebarTitle">Your courses</h2>
      {
        props.selectedGroups.map(groupObj => {
          let group = groupObj.groupName;
          return <CourseCard key={group}
                      courseGroup={group}
                      courseData={props.allGroups[group]}
                      expanded={props.expandedCourseGroup[0] === group && props.expandedCourseGroup[1] === util.SIDEBAR}
                      setExpandedCourseGroup={(group) => props.setExpandedCourseGroup([group, util.SIDEBAR])}
                      getFullCourseData={props.getFullCourseData}
                      removeGroup={props.removeGroup}
                      isAdded />;
        })
      }
      {
        totalCredits > 0
          &&  <div className="creditTotal">
                {`${totalCredits} credit${totalCredits === 1 ? "" : "s"}`}
              </div>
      }
    </div>
  )
}