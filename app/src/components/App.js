import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header/Header";
import "./App.css"

export default function App() {
  const [courseData, setCourseData] = useState(null);

  const refresh = () => {
    axios.get("https://hyperschedule.herokuapp.com/api/v3/courses")
      .then(response => setCourseData(response.data))
      .catch(err => console.log(`[ERR]: ${err}`));
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Header refreshCallback={refresh} />
    </>
  )
}