import CourseCard from "../CourseCard/CourseCard";
import "./CourseSideBar.css";

export default function CourseSideBar(props) {
  return (
    <div className="courseSidebar">
      <h2 className="sidebarTitle">Your courses</h2>
      {
        props.selectedGroups.map(group => 
          <CourseCard key={group}
                      courseGroup={group}
                      courseData={props.allGroups[group]}
                      expanded={props.expandedCourseGroup === group}
                      setExpandedCourseGroup={props.setExpandedCourseGroup}
                      getFullCourseData={props.getFullCourseData}
                      removeGroup={props.removeGroup}
                      addGroup={props.addGroup}
                      isAdded={true} />
        )
      }
    </div>
  )
}