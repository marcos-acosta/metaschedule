import json
import urllib.request
from util import *
import re

with open('data.txt') as json_file:
    data = json.load(json_file)

COURSES = data['data']['courses']
TERMS = data['data']['terms']
UNTIL = data['until']
ERROR = data['error']
FULL = data['full']

searches =  [course['courseCode'] + ' ' + \
                    course['courseName'] for course in COURSES.values()]
keys = list(COURSES.keys())
SEARCH_DICT = {searches[i]: keys[i] for i in range(len(keys))}