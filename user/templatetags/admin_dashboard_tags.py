from django import template
from user.models import tblDoctor, tblClient, tblAppointment

register = template.Library()

@register.simple_tag
def get_admin_stats():
    stats = {
        'total_doctors': tblDoctor.objects.count(),
        'total_patients': tblClient.objects.count(),
        'total_appointments': tblAppointment.objects.count(),
        'active_appointments': tblAppointment.objects.filter(isAccepted=True).count(),
    }
    return stats
