import json
import urllib.request, json
from util import *
from scheduleObjects import Course, Schedule
import re

class CourseData:
    # Constructor
    def __init__(self, local=False):
        if local:
            with open('data.txt') as json_file:
                data = json.load(json_file)
        else:
            url = "https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc"
            data = urllib.request.urlopen(url).read().decode()
            data = json.loads(data)
        self.courses = data['data']['courses']
        self.terms = data['data']['terms']
        self.until = data['until']
        self.error = data['error']
        self.full = data['full']
        searches =  [course['courseCode'] + ' ' + \
                    course['courseName'] for course in self.courses.values()]
        keys = list(self.courses.keys())
        self.searchDict = {searches[i]: keys[i] for i in range(len(keys))}

    # Searches within courses by keyword
    def search(self, keyword):
        keyword = keyword.lower().split(' ')
        reSearch = ''
        for word in keyword:
            reSearch = reSearch + '(?=.*' + word + ')'
        return [self.searchDict[key] for key in self.searchDict.keys() if re.search(reSearch, key.lower())]


    # Converts a course code into a course object
    def codeToCourse(self, code):
        return Course(self.courses[code])

    
    # Check to see if theres a conflict with the code list given
    def schedule_conflict(self, codeList):
        courses = [self.codeToCourse(code) for code in codeList]
        length = len(courses)
        for i in range(0, length - 1):
            for j in range(i + 1, length):
                if course_conflict(courses[i], courses[j]):
                    return True
        return False
        