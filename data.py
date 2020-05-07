import json
import urllib.request
from data_util import *
import re

# Load data
data = retrieve_local_data()

''' GLOBAL DATA '''

COURSES = data['data']['courses']
TERMS = data['data']['terms']
UNTIL = data['until']
ERROR = data['error']
FULL = data['full']

searches =  [course['courseCode'] + ' ' + \
                    course['courseName'] for course in COURSES.values()]
keys = list(COURSES.keys())
SEARCH_DICT = {searches[i]: keys[i] for i in range(len(keys))}

''' GLOBAL DATA '''

# Get courses status
def codeToStatus(code):
    return COURSES[code]['courseEnrollmentStatus']


# Get course credits
def codeToCredits(code):
    return COURSES[code]['courseCredits']


# Get course seats total
def codeToSeatsTotal(code):
    return COURSES[code]['courseSeatsTotal']


# Get course seats filled
def codeToSeatsFilled(code):
    return COURSES[code]['courseSeatsFilled']


# Get course schedules
def codeToSchedule(code):
    return COURSES[code]['courseSchedule']


# Get latest course data
def refresh():
    global COURSES
    # Get data
    data = retrieve_remote_data()
    # Save data to file
    save_json(data)
    # Use data
    COURSES = data['data']['courses']
    