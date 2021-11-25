import { useState } from "react";
import Header from "./Header/Header";
import "./App.css"
import CourseView from "./CourseView/CourseView";
import Switcher from "./Switcher/Switcher";
import ScheduleView from "./ScheduleView/ScheduleView";

export default function App(props) {
  const [viewState, setViewState] = useState(0);
  const [expandedCourseGroup, setExpandedCourseGroup] = useState([null, null]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const addGroup = (group, credits) => {
    setSelectedGroups([...selectedGroups, {
      groupName: group,
      credits: credits
    }]);
  }

  const removeGroup = (group) => {
    setSelectedGroups(selectedGroups.filter(group_ => group_.groupName !== group));
  }

  return (
    <>
      <Header refreshCallback={props.refresh}/>
      <Switcher options={["Courses", "Schedules"]}
                value={viewState}
                onChange={(i) => setViewState(i)}
                className="viewSwitcher" />
      {
        <>
          <CourseView isLoading={props.isLoading} 
                      courses={props.filteredData}
                      searchString={props.searchString}
                      setSearchString={props.setSearchString}
                      getFullCourseData={props.getFullCourseData}
                      allGroups={props.allGroups}
                      expandedCourseGroup={expandedCourseGroup}
                      setExpandedCourseGroup={setExpandedCourseGroup}
                      hidden={viewState === 1}
                      selectedGroups={selectedGroups}
                      addGroup={addGroup}
                      removeGroup={removeGroup} />
          <ScheduleView hidden={viewState === 0} />
        </>
      }
    </>
  )
}