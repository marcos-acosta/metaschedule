import urllib.request, json
import pandas as pd
from util import *
from scheduleObjects import Course, Schedule
from courseData import courseData

# Courses you want
my_courses = []

# Get all course data from url
def save_course_dictionary():
    url = "https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc"
    data = urllib.request.urlopen(url).read().decode()
    data_dict = json.loads(data)
    save_json(data_dict)

# Save json data to file
def save_json(data):
    with open('data.txt', 'w') as outfile:
        json.dump(data, outfile)

# Retrieve json data from file
def retrieve_local_data():
    with open('data.txt') as json_file:
        data = json.load(json_file)
    return data


# data_dict = retrieve_local_data()
# courses = data_dict['data']['courses']

courseData = courseData(local=True)
courses = courseData.courses

searches =  [course['courseSortKey'][0] + ' ' + str(course['courseSortKey'][1]) + ' ' + \
            course['courseName'] for course in courses.values()]

econ1 = Course(courses['ENGR 079 HM-05'])
econ2 = Course(courses['ECON 142 PZ-01'])

# print(econ1.full())
# print(econ2.full())
# print(course_conflict(econ1, econ2))

print(courseData.search('data structures 70'))