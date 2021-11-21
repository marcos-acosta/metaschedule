import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header/Header";
import "./App.css"
import util from "../util";
import CourseView from "./CourseView/CourseView";

export default function App() {
  const [fullData, setfullData] = useState(null);
  const [groupedData, setGroupedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState(0);

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

  return (
    <>
      <Header refreshCallback={refresh} viewState={viewState} setViewState={setViewState}/>
      {
        viewState === 0
          ? <CourseView isLoading={isLoading} courses={groupedData} />
          : <>Schedule view</>
      }
    </>
  )
}