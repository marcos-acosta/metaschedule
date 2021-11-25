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
                          expanded={props.expandedCourseGroup === group}
                          setExpandedCourseGroup={props.setExpandedCourseGroup}
                          getFullCourseData={props.getFullCourseData}
                          addGroup={props.addGroup}
                          removeGroup={props.removeGroup}
                          isAdded={props.selectedGroups.includes(group)} />)
      }
    </div>
  )
}