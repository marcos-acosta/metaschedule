import CourseCard from "./../CourseCard/CourseCard";

export default function CourseList(props) {
  return (
    <div className="courseContainer">
      {
        props.isLoading && Object.keys(props.courses).length === 0
          ? <div>Loading...</div>
          : Object.keys(props.courses).map((group, i) => 
              <CourseCard key={i}
                          courseGroup={group}
                          courseData={props.courses[group]}
                          expanded={props.expandedCourseGroup === group}
                          setExpandedCourseGroup={props.setExpandedCourseGroup} />)
      }
    </div>
  )
}