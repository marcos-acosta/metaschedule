from util import *
from scheduleObjects import Course, Schedule, Collection, get_all_permutations
from data import COURSES

results = get_groups(search('electromagnetic theory'))
class1 = results['PHYS 051 HM']

results = get_groups(search('engineering'))
class2 = results['ENGR 079 HM']

results = get_groups(search('data structures'))
class3 = results['CSCI 070 HM']

results = get_groups(search('physics laboratory'))
class4 = results['PHYS 050 HM']

results = get_groups(search('engineering practicum'))
class5 = results['ENGR 079P HM']

results = get_groups(search('data structures lab'))
class6 = results['CSCI 070L HM']

results = get_groups(search('film music'))
class7 = results['MUS 067 HM']

# courses = [class1, class2]
courses = [class1, class2, class3, class4, class5, class6, class7]

all_courses = get_all_permutations(courses)

print(len(all_courses))

# all_courses_c = [Collection(col) for col in all_courses]
# all_courses_c = sorted(all_courses, key=lambda x: -x.availability)

filtered = filter_results(all_courses, ['PHYS 050 HM-02', 'CSCI 070 HM-04'])

print(len(filtered))