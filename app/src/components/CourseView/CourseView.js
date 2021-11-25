import CourseList from "../CourseList/CourseList";
import CourseSideBar from "../CourseSideBar/CourseSideBar";
import SearchBar from "../SearchBar/SearchBar";
import "./CourseView.css";

export default function CourseView(props) {
  return (
    <div className={`courseViewContainer ${props.hidden ? 'hidden' : ''}`}>
      <div className="courseListContainer">
        <div className="searchBarContainer">
          <SearchBar  value={props.searchString} 
                      onChange={props.setSearchString} 
                      className="searchBar"
                      placeholder="Search" />
        </div>
        <CourseList {...props} />
      </div>
      <div className="courseSideBarContainer">
        <CourseSideBar {...props} />
      </div>
    </div>
  )
}