import { useState } from "react";
import App from "./App";

export default function SearchContext(props) {
  const [searchString, setSearchString] = useState("");

  const filterGroupedData = () => {
    return Object.fromEntries(Object.entries(props.keywords).filter(
      ([keyword, _]) => 
        keyword.toLowerCase().match(new RegExp(searchString.toLowerCase()))
    ).map(([_, courseGroup]) => [courseGroup, props.groupedData[courseGroup]]))
  };

  return <App setSearchString={setSearchString}
              filteredData={filterGroupedData()}
              {...props} />
}