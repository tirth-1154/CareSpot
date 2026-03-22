from datetime import timedelta
from django.utils import timezone


def auto_reject_expired_appointments():
    """
    24 hours se purani pending appointments ko auto-reject karta hai
    aur patient ko notification bhejta hai.
    """
    from .models import tblAppointment, tblnotification

    # 24 hours pehle ka time
    cutoff_time = timezone.now() - timedelta(hours=24)

    # Pending appointments jo 24 hours se zyada purani hain
    expired_appointments = tblAppointment.objects.filter(
        isAccepted=False,
        isRejected=False,
        createdDT__isnull=False,
        createdDT__lte=cutoff_time
    )

    count = 0
    for appointment in expired_appointments:
        # Auto-reject karo
        appointment.isRejected = True
        appointment.save()

        # Patient ko notification bhejo
        patient_user = appointment.clientID.userID
        doctor_name = appointment.doctorID.displayName
        app_date = appointment.appointmentDate.strftime("%b %d, %Y")
        app_time = appointment.appointmentTime.strftime("%I:%M %p")

        message = (
            f"Your appointment with {doctor_name} on {app_date} at {app_time} "
            f"has been automatically cancelled. Doctor not available, please book another time."
        )

        tblnotification.objects.create(
            userID=patient_user,
            message=message,
            isRead=False
        )
        count += 1

    return count


def delete_expired_otps():
    """
    24 hours se purane OTPs ko delete karta hai.
    """
    from .models import OTP

    # 24 hours pehle ka time
    cutoff_time = timezone.now() - timedelta(hours=24)

    # Filter aur delete
    expired_otps = OTP.objects.filter(created_at__lte=cutoff_time)
    count = expired_otps.count()
    expired_otps.delete()

    return count
