import CourseCard from "./../CourseCard/CourseCard";
import "./CourseList.css";

export default function CourseList(props) {
  return (
    <div className="courseContainer">
      {
        props.isLoading && Object.keys(props.courses).length === 0
          ? <div>Loading...</div>
          : Object.keys(props.courses).map((group, i) => 
              <CourseCard key={i}
                          courseGroup={group}
                          courseData={Object.values(props.courses[group])[0]}
                          expanded={props.expandedCourseGroup === group}
                          setExpandedCourseGroup={props.setExpandedCourseGroup} />)
      }
    </div>
  )
}