import { useState } from "react";
import Header from "./Header/Header";
import "./App.css"
import CourseView from "./CourseView/CourseView";
import Switcher from "./Switcher/Switcher";

export default function App(props) {
  const [viewState, setViewState] = useState(0);
  const [expandedCourseGroup, setExpandedCourseGroup] = useState(null);

  return (
    <>
      <Header refreshCallback={props.refresh}/>
      <Switcher options={["Courses", "Schedules"]}
                value={viewState}
                onChange={(i) => setViewState(i)}
                className="viewSwitcher" />
      {
        viewState === 0
          ? <CourseView isLoading={props.isLoading} 
                        courses={props.filteredData}
                        searchString={props.searchString}
                        setSearchString={props.setSearchString}
                        getFullCourseData={props.getFullCourseData}
                        expandedCourseGroup={expandedCourseGroup}
                        setExpandedCourseGroup={setExpandedCourseGroup} />
          : <>Schedule view</>
      }
    </>
  )
}