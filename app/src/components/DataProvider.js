import { useEffect, useState } from "react";
import axios from "axios";
import util from "../util";
import SearchContext from "./SearchContext";

export default function DataProvider() {
  const [fullData, setfullData] = useState(null);
  const [groupedData, setGroupedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
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

  return <SearchContext groupedData={groupedData}
              isLoading={isLoading}
              keywords={keywords}
              refresh={refresh}/>
}