import math
import re
from data import SEARCH_DICT, COURSES, codeToStatus


# Regular time to military time
def military_time(time):
    time = time.split(':')
    return int(time[0])*60 + int(time[1])


# Military time to regular time
def regular_time(military):
    return str(math.floor(military/60)) + ':' + str(int(military % 60))


# Determines if two courses conflict
def course_conflict(schedules1, schedules2):
    for schedule1 in schedules1:
        for schedule2 in schedules2:
            if time_conflict(schedule1, schedule2):
                return True
    return False


# Check that two strings of days have no overlap
def different_days(days1, days2):
    for char in days1:
        if char in days2:
            return False
    return True


# Determine if two time gaps conflict
def time_conflict(schedule1, schedule2):
    days1 = schedule1.days
    days2 = schedule2.days
    # If they don't share any of the same days (or one doesn't have a set time), no conflict
    if days1 == '' or days2 == '' or different_days(days1, days2):
        return False
    start1 = military_time(schedule1.startTime)
    end1 = military_time(schedule1.endTime)
    start2 = military_time(schedule2.startTime)
    end2 = military_time(schedule2.endTime)
    # Class 1 starts but ends after class 2 starts OR class 2 starts but ends after class 1 starts
    if (start1 < start2 and end1 > start2) or (start1 > start2 and end2 > start1) or start1 == start2:
            return True
    return False


# Combine results into different courses (not sections)
def get_groups(results):
    groups = {}
    for result in results:
        if result.split('-')[0] in groups:
            groups[result.split('-')[0]].append(result)
        else:   
            groups[result.split('-')[0]] = [result]
    return groups


# Searches within courses by keyword
def search(keyword):
    keyword = keyword.lower().split(' ')
    reSearch = ''
    for word in keyword:
        reSearch = reSearch + '(?=.*' + word + ')'
    return [SEARCH_DICT[key] for key in SEARCH_DICT.keys() if re.search(reSearch, key.lower())]


# Filter a list of permutations by specific sections
def filter_results(all_courses, codes):
    roots = [code.split('-')[0] for code in codes]
    columns = []
    # Determine which columns are the ones we're interested in
    for root in roots:
        for i, course in enumerate(all_courses[0]):
            if course.split('-')[0] == root:
                columns.append(i)
    # That section isn't of a class here
    if len(columns) != len(codes):
        return None
    filtered = [row for row in all_courses if check_filters(row, columns, codes)]
    return filtered


# Filter method for filter_results
def check_filters(row, columns, codes):
    for i, column in enumerate(columns):
        if row[column] != codes[i]:
            return False
    return True


# Take out sections that are closed
def filter_closed(courses):
    for sections in courses:
        for section in sections:
            if codeToStatus(section) == 'closed':
                sections.remove(section)
    return courses


# Make sure every course is accounted for (>=1 section)
def check_courses(courses):
    # Make sure you have at least one section of each
    for sections in courses:
        if len(sections) == 0:
            return False
    return True