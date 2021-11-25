const util = {
  getCourseGroup(courseCode) {
    return courseCode.split('-')[0];
  },
  getCourseSection(courseCode) {
    return courseCode.split('-')[1];
  },
  splitCourseCode(courseCode) {
    return courseCode.split('-');
  },
  splitCourseGroup(crouseGroup) {
    const split = crouseGroup.split(' ');
    return {
      department: split[0], 
      number: split.slice(1, -1).join(' '),
      college: split.at(-1)
    };
  },
  militaryToAMPM(military) {
    let [hh, mm] = military.split(":").map(x => parseInt(x));
    let pm = hh >= 12;
    hh = hh > 12 ? hh - 12 : hh;
    return `${hh}:${`${mm}`.padStart(2, '0')} ${pm ? 'PM' : 'AM'}`;
  },
  colors: [
    "course-group-blue",
    "course-group-purple",
    "course-group-green",
    "course-group-red",
    "course-group-yellow",
    "course-group-aqua",
  ],
  HARVEY_MUDD: "HM",
  CLAREMONT_MCKENNA: "CMC",
  SCRIPPS: "SC",
  POMONA: "PO",
  PITZER: "PZ",
  COURSELIST: "COURSELIST",
  SIDEBAR: "SIDEBAR"
}
export default util;