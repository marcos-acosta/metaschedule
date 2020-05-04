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
