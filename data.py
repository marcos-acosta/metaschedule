import json
import urllib.request
import re

# Load data
with open('data.txt') as json_file:
    data = json.load(json_file)

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
def course_status(code):
    return COURSES[code]['courseEnrollmentStatus']


# Get latest course data
def refresh():
    global COURSES
    # Get data
    with urllib.request.urlopen("https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc") as url:
        data = json.loads(url.read().decode())
    # Save data to file
    with open('data.txt', 'w') as outfile:
        json.dump(data, outfile)
    # Use data
    COURSES = data['data']['courses']
    