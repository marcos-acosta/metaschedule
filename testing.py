import urllib.request, json
import pandas as pd

class Course:
    def __init__(self, obj):
        self.code = obj['courseCode']
        self.name = obj['courseName']
        self.sortKey = obj['courseSortKey']
        self.mutualExclusionKey = obj['courseMutualExclusionKey']
        self.description = obj['courseDescription']
        self.instructors = obj['courseInstructors']
        self.term = obj['courseTerm']
        self.schedule = obj['courseSchedule']
        self.credits = obj['courseCredits']
        self.seatsTotal = obj['courseSeatsTotal']
        self.seatsFilled = obj['courseSeatsFilled']
        self.waitlistLength = obj['courseWaitlistLength']
        self.enrollmentStatus = obj['courseEnrollmentStatus']

    def __repr__(self):
        return  '[' + self.code + '] ' + \
                self.name + ', ' + \
                self.credits + ' credits | ' + \
                self.abridge(self.description)

    def full(self):
        return  '[' + str(self.code) + '] ' + str(self.name) + '\n' + \
                'Sort key: ' + str(self.sortKey) + '\n' + \
                'Mutual exlusion key: ' + str(self.mutualExclusionKey) + '\n' + \
                'Description: ' + str(self.description) + '\n' + \
                'Instructors: ' + str(self.instructors) + '\n' + \
                'Term: ' + str(self.term) + '\n' + \
                'Schedule: ' + str(self.schedule) + '\n' + \
                'Credits: ' + str(self.credits) + '\n' + \
                'Seats total: ' + str(self.seatsTotal) + '\n' + \
                'Seats filled: ' + str(self.seatsFilled) + '\n' + \
                'Waitlist length: ' + str(self.waitlistLength) + '\n' + \
                'Enrollment status: ' + str(self.enrollmentStatus)

    @staticmethod
    def abridge(string):
        if len(string) < 100:
            return string
        else:
            return string[:100] + '...'

class Schedule:
    def __init__(self, obj):
        pass

# Courses you want
my_courses = []

# Get all course data from url
def save_course_dictionary():
    url = "https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc"
    data = urllib.request.urlopen(url).read().decode()
    data_dict = json.loads(data)
    save_json(data_dict)

def save_json(data):
    with open('data.txt', 'w') as outfile:
        json.dump(data, outfile)

def retrieve_local_data():
    with open('data.txt') as json_file:
        data = json.load(json_file)
    return data

data_dict = retrieve_local_data()
courses = data_dict['data']['courses']

chem = Course(courses['CHEM 151 HM-06'])
print(chem.full())