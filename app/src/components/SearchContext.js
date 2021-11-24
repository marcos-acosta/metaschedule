import { useState } from "react";
import App from "./App";

export default function SearchContext(props) {
  const [searchString, setSearchString] = useState("");
  
  const searchToRegexp = (search) => (
    RegExp(search ? search.toLowerCase().trim().split(' ').map(keyword => `(?=.*${keyword}.*)`).join('') : '')
  )

  const filterGroupedData = () => {
    let regex = new RegExp(searchToRegexp(searchString));
    return Object.fromEntries(
      Object.entries(props.groupedData).filter(
        ([_, group]) => 
          group.searchKey.toLowerCase().match(regex)
      ));
  };

  return <App searchString={searchString}
              setSearchString={setSearchString}
              filteredData={filterGroupedData()}
              {...props} />
}