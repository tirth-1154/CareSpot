from django import template
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from user.models import tblDoctor, tblClient, tblAppointment, tblPayment

register = template.Library()

@register.simple_tag
def get_admin_analytics():
    today = timezone.now().date()
    last_7_days = today - timedelta(days=6)
    
    # 7-day appointment trend
    appointments_by_day = tblAppointment.objects.filter(
        appointmentDate__gte=last_7_days, 
        appointmentDate__lte=today
    ).values('appointmentDate').annotate(count=Count('appointmentID')).order_by('appointmentDate')
    
    # Fill in gaps for the chart
    chart_data = []
    day_map = {item['appointmentDate']: item['count'] for item in appointments_by_day}
    for i in range(7):
        day = last_7_days + timedelta(days=i)
        chart_data.append({
            'label': day.strftime('%a'),
            'count': day_map.get(day, 0)
        })

    analytics = {
        'stats': {
            'total_doctors': tblDoctor.objects.count(),
            'total_patients': tblClient.objects.count(),
            'total_appointments': tblAppointment.objects.count(),
            'active_appointments': tblAppointment.objects.filter(isAccepted=True).count(),
            'total_revenue': tblPayment.objects.filter(paymentStatus='paid').aggregate(Sum('totalAmount'))['totalAmount__sum'] or 0,
        },
        'chart_labels': [d['label'] for d in chart_data],
        'chart_values': [d['count'] for d in chart_data],
        'recent_patients': tblClient.objects.order_by('-clientID')[:5],
        'upcoming_appointments': tblAppointment.objects.filter(
            appointmentDate__gte=today,
            isRejected=False
        ).order_by('appointmentDate', 'appointmentTime')[:5],
    }
    return analytics
