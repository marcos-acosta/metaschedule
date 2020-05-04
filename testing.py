import pandas as pd
from util import *
from scheduleObjects import Course, Schedule, Agenda
from courseData import CourseData

# Courses you want
course_key_list = []

courseData = CourseData(local=True)
courses = courseData.courses

# econ1 = Course(courses['ENGR 079 HM-05'])
# econ2 = Course(courses['ECON 142 PZ-01'])

# print(econ1.full())
# print(econ2.full())
# print(course_conflict(econ1, econ2))

results = get_groups(courseData.search('electromagnetic theory'))
class1 = results['PHYS 051 HM']

results = get_groups(courseData.search('engineering'))
class2 = results['ENGR 079 HM']

results = get_groups(courseData.search('data structures'))
class3 = results['CSCI 070 HM']

# courses = [class1, class2, class3]
courses = [class1, class2]
agenda = Agenda(courses, courseData)

# print(courseData.schedule_conflict(['PHYS 051 HM-05', 'ENGR 079 HM-04']))

# sections = agenda.possible_sections(courses)

for sched in agenda.all_courses:
    print(sched)