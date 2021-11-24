import { useState } from "react";
import App from "./App";

export default function SearchContext(props) {
  const [searchString, setSearchString] = useState("");

  const filterGroupedData = () => {
    return Object.fromEntries(
      Object.entries(props.groupedData).filter(
        ([_, group]) => 
          group.searchKey.toLowerCase().match(new RegExp(searchString.toLowerCase()))
      ));
  };

  return <App searchString={searchString}
              setSearchString={setSearchString}
              filteredData={filterGroupedData()}
              {...props} />
}