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
    return [split[0], split.slice(1, -1).join(' '), split[-1]];
  }
}
export default util;