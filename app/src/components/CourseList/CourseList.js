import CourseCard from "./../CourseCard/CourseCard";
import "./CourseList.css";

export default function CourseList(props) {
  return (
    <div className="courseContainer">
      {
        props.courses && Object.keys(props.courses).length > 0
          ? Object.keys(props.courses).map((group, i) => 
              <CourseCard key={i}
                          courseGroup={group}
                          courseData={Object.values(props.courses[group])[0]} />)
          : <div>Loading...</div>
      }
    </div>
  )
}