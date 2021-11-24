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
  PITZER: "PZ"
}
export default util;