import util from "../../util";
import CourseCard from "./../CourseCard/CourseCard";

export default function CourseList(props) {
  return (
    <div className="courseContainer">
      {
        props.isLoading && Object.keys(props.courses).length === 0
          ? <div>Loading...</div>
          : Object.keys(props.courses).map(group => 
              <CourseCard key={group}
                          courseGroup={group}
                          courseData={props.courses[group]}
                          expanded={props.expandedCourseGroup[0] === group && props.expandedCourseGroup[1] === util.COURSELIST}
                          setExpandedCourseGroup={(group) => props.setExpandedCourseGroup([group, util.COURSELIST])}
                          getFullCourseData={props.getFullCourseData}
                          addGroup={props.addGroup}
                          removeGroup={props.removeGroup}
                          isAdded={props.selectedGroups.map(groupObj => groupObj.groupName).includes(group)} />)
      }
    </div>
  )
}