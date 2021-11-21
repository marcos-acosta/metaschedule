import CourseCard from "./../CourseCard/CourseCard";

export default function CourseList(props) {
  console.log(props.courses);
  return (
    <div className="courseListContainer">
      {
        props.courses && Object.keys(props.courses).length > 0
          ? Object.keys(props.courses).map((group, i) => <CourseCard key={i} courseGroup={group} />)
          : <div>Loading...</div>
      }
    </div>
  )
}