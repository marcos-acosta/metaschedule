# Course class
class Course:
    def __init__(self, obj):
        self.code = obj['courseCode']
        self.name = obj['courseName']
        self.sortKey = obj['courseSortKey']
        self.mutualExclusionKey = obj['courseMutualExclusionKey']
        self.description = obj['courseDescription']
        self.instructors = obj['courseInstructors']
        self.term = obj['courseTerm']
        self.schedule = [Schedule(schedule_object) for schedule_object in obj['courseSchedule']]
        self.credits = obj['courseCredits']
        self.seatsTotal = obj['courseSeatsTotal']
        self.seatsFilled = obj['courseSeatsFilled']
        self.waitlistLength = obj['courseWaitlistLength']
        self.enrollmentStatus = obj['courseEnrollmentStatus']
        self.root = self.code.split('-')[0]

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

# Schedule class
class Schedule:
    # Constructor
    def __init__(self, obj):
        self.days = obj['scheduleDays']
        self.endDate = obj['scheduleEndDate']
        self.endTime = obj['scheduleEndTime']
        self.location = obj['scheduleLocation']
        self.startDate = obj['scheduleStartDate']
        self.startTime = obj['scheduleStartTime']
        self.termCount = obj['scheduleTermCount']
        self.terms = obj['scheduleTerms']
    
    def __repr__(self):
        return 'Meets ' + self.days + ', from ' + self.startTime + ' to ' + self.endTime + '.'

# Agenda class
class Agenda:
    # Constructor
    def __init__(self, courses, courseData):
        self.courses = courses
        self.data = courseData
        self.all_courses = self.possible_sections()
        self.clean_conflicts()
        

    def possible_sections(self):
        courses = sorted(self.courses, key=len)
        return self.recurse_courses(courses, [], [])


    def recurse_courses(self, courses, meta, building, top_level=True):
        if len(courses) == 0:
            meta.append(building)
            return
        for section in courses[0]:
            if top_level:
                # Get the ball rolling
                self.recurse_courses(courses[1:], meta, [section], False)
            else:
                building.append(section)
                self.recurse_courses(courses[1:], meta, building.copy(), False)
                building.remove(section)
        if top_level:
            return meta

    
    def clean_conflicts(self):
        self.all_courses = [codeList for codeList in self.all_courses if not self.data.schedule_conflict(codeList)]