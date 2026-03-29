from user.models import tblDoctorSchedule
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CareSpot.settings')
django.setup()

schedules = tblDoctorSchedule.objects.filter(doctorID=1).order_by('day_of_week')
print("Doctor 1 Schedule:")
for s in schedules:
    print(f"Day {s.day_of_week}: {s.start_time} to {s.end_time}, Available: {s.is_available}")
