import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header/Header";
import "./App.css"
import util from "../util";
import CourseView from "./CourseView/CourseView";
import Switcher from "./Switcher/Switcher";

export default function App() {
  const [fullData, setfullData] = useState(null);
  const [groupedData, setGroupedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [expandedCourseGroup, setExpandedCourseGroup] = useState(null);
  const keywords = Object.fromEntries(
    Object.entries(groupedData).map(
      ([group, courses]) => 
        [`${group} ${Object.values(courses)[0].courseName}`, group]
    )
  );

  const refresh = () => {
    setIsLoading(true);
    axios.get("https://hyperschedule.herokuapp.com/api/v3/courses")
      .then(response => setfullData(response.data))
      .catch(err => console.log(`[ERR]: ${err}`))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    let groupedData_ = {};
    if (fullData) {
      Object.keys(fullData.data.courses).forEach(courseCode => {
        const course = fullData.data.courses[courseCode];
        const [courseGroup, courseSection] = util.splitCourseCode(courseCode);
        if (groupedData_.hasOwnProperty(courseGroup)) {
          groupedData_[courseGroup][courseSection] = course;
        } else {
          groupedData_[courseGroup] = {
            [courseSection]: course
          };
        }
      });
    }
    setGroupedData(groupedData_);
  }, [fullData]);

  const filterGroupedData = () => (
    Object.fromEntries(Object.entries(keywords).filter(
      ([keyword, _]) => 
        keyword.toLowerCase().match(new RegExp(searchString.toLowerCase()))
    ).map(([_, courseGroup]) => [courseGroup, groupedData[courseGroup]]))
  )

  return (
    <>
      <Header refreshCallback={refresh}/>
      <Switcher options={["Courses", "Schedules"]}
                value={viewState}
                onChange={(i) => setViewState(i)}
                className="viewSwitcher" />
      {
        viewState === 0
          ? <CourseView isLoading={isLoading} 
                        courses={filterGroupedData()}
                        searchString={searchString}
                        setSearchString={setSearchString}
                        expandedCourseGroup={expandedCourseGroup}
                        setExpandedCourseGroup={setExpandedCourseGroup} />
          : <>Schedule view</>
      }
    </>
  )
}