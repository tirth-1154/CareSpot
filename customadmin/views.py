from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.db.models import Count, Avg, Q
from django.views.decorators.http import require_POST
from datetime import datetime, timedelta, date
from user.models import (
    tblUser, tblDoctor, tblClient, tblAppointment, tblReview,
    tblDoctorPost, tblCategory, tblSubcategory, tblState, tblCity,
    tblchat, tblnotification, tblFollow, tblComments, tblclientHistory
)
from .decorators import admin_login_required

# ─── Admin Credentials ───────────────────────────────────────
ADMIN_EMAIL = 'admin@carespot.com'
ADMIN_PASSWORD = 'admin@123'


# ═══════════════════════════════════════════════════════════════
#  AUTH VIEWS
# ═══════════════════════════════════════════════════════════════

def admin_login(request):
    """Admin login page. Redirects to dashboard if already authenticated."""
    if request.session.get('is_site_admin'):
        return redirect('customadmin:admin_dashboard')

    error = None
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()

        if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
            request.session['is_site_admin'] = True
            request.session['admin_email'] = email
            return redirect('customadmin:admin_dashboard')
        else:
            error = 'Invalid email or password.'

    return render(request, 'customadmin/admin_login.html', {'error': error})


def admin_logout(request):
    """Clear admin session and redirect to login."""
    request.session.pop('is_site_admin', None)
    request.session.pop('admin_email', None)
    return redirect('customadmin:admin_login')


# ═══════════════════════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════════════════════

@admin_login_required
def admin_dashboard(request):
    today = date.today()
    seven_days_ago = today - timedelta(days=6)

    # Stats
    total_doctors = tblDoctor.objects.count()
    total_patients = tblClient.objects.count()
    total_appointments = tblAppointment.objects.count()
    total_reviews = tblReview.objects.count()
    total_users = tblUser.objects.count()
    total_blogs = tblDoctorPost.objects.count()

    # Today's stats
    today_appointments = tblAppointment.objects.filter(appointmentDate=today).count()
    pending_appointments = tblAppointment.objects.filter(isAccepted=False, isRejected=False).count()
    accepted_appointments = tblAppointment.objects.filter(isAccepted=True).count()
    rejected_appointments = tblAppointment.objects.filter(isRejected=True).count()

    # Average rating
    avg_rating = tblReview.objects.aggregate(avg=Avg('rating'))['avg'] or 0
    avg_rating = round(avg_rating, 1)

    # Recent appointments
    recent_appointments = tblAppointment.objects.select_related(
        'clientID', 'doctorID'
    ).order_by('-createdDT')[:10]

    # Recent users
    recent_users = tblUser.objects.order_by('-registrationDT')[:5]

    # Top rated doctors
    top_doctors = tblDoctor.objects.annotate(
        avg_rating=Avg('tblreview__rating'),
        review_count=Count('tblreview')
    ).order_by('-avg_rating')[:5]

    context = {
        'total_doctors': total_doctors,
        'total_patients': total_patients,
        'total_appointments': total_appointments,
        'total_reviews': total_reviews,
        'total_users': total_users,
        'total_blogs': total_blogs,
        'today_appointments': today_appointments,
        'pending_appointments': pending_appointments,
        'accepted_appointments': accepted_appointments,
        'rejected_appointments': rejected_appointments,
        'avg_rating': avg_rating,
        'recent_appointments': recent_appointments,
        'recent_users': recent_users,
        'top_doctors': top_doctors,
    }
    return render(request, 'customadmin/admin_dashboard.html', context)


# ═══════════════════════════════════════════════════════════════
#  CHART DATA API
# ═══════════════════════════════════════════════════════════════

@admin_login_required
def admin_chart_data(request):
    """Return JSON data for dashboard charts."""
    today = date.today()

    # Appointments over last 7 days
    labels = []
    appointment_counts = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        labels.append(d.strftime('%b %d'))
        count = tblAppointment.objects.filter(appointmentDate=d).count()
        appointment_counts.append(count)

    # User registrations over last 7 days
    user_counts = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count = tblUser.objects.filter(registrationDT__date=d).count()
        user_counts.append(count)

    # Appointment status distribution
    pending = tblAppointment.objects.filter(isAccepted=False, isRejected=False).count()
    accepted = tblAppointment.objects.filter(isAccepted=True).count()
    rejected = tblAppointment.objects.filter(isRejected=True).count()

    # Top specializations by doctor count
    specializations = list(
        tblSubcategory.objects.annotate(
            doc_count=Count('tbldoctor')
        ).filter(doc_count__gt=0).order_by('-doc_count').values('subcategoryName', 'doc_count')[:6]
    )
    spec_labels = [s['subcategoryName'] for s in specializations]
    spec_counts = [s['doc_count'] for s in specializations]

    data = {
        'labels': labels,
        'appointments': appointment_counts,
        'users': user_counts,
        'status': {
            'pending': pending,
            'accepted': accepted,
            'rejected': rejected,
        },
        'specializations': {
            'labels': spec_labels,
            'counts': spec_counts,
        }
    }
    return JsonResponse(data)


# ═══════════════════════════════════════════════════════════════
#  MANAGEMENT VIEWS
# ═══════════════════════════════════════════════════════════════

@admin_login_required
def admin_users(request):
    query = request.GET.get('q', '').strip()
    role_filter = request.GET.get('role', '').strip()

    users = tblUser.objects.all().order_by('-registrationDT')

    if query:
        users = users.filter(
            Q(userName__icontains=query) |
            Q(email__icontains=query) |
            Q(mobileNumber__icontains=query)
        )
    if role_filter == 'doctor':
        users = users.filter(IsDoctor=True)
    elif role_filter == 'patient':
        users = users.filter(IsDoctor=False)

    context = {
        'users': users,
        'query': query,
        'role_filter': role_filter,
        'total_count': users.count(),
    }
    return render(request, 'customadmin/admin_users.html', context)


@admin_login_required
def admin_doctors(request):
    query = request.GET.get('q', '').strip()
    spec_filter = request.GET.get('specialization', '').strip()

    doctors = tblDoctor.objects.select_related('userID', 'subcategoryID').annotate(
        avg_rating=Avg('tblreview__rating'),
        review_count=Count('tblreview'),
        patient_count=Count('tblappointment__clientID', distinct=True),
    ).order_by('-doctorID')

    if query:
        doctors = doctors.filter(
            Q(displayName__icontains=query) |
            Q(userID__email__icontains=query) |
            Q(displayContact__icontains=query)
        )
    if spec_filter:
        doctors = doctors.filter(subcategoryID=spec_filter)

    subcategories = tblSubcategory.objects.all()
    context = {
        'doctors': doctors,
        'query': query,
        'spec_filter': spec_filter,
        'subcategories': subcategories,
        'total_count': doctors.count(),
    }
    return render(request, 'customadmin/admin_doctors.html', context)


@admin_login_required
def admin_patients(request):
    query = request.GET.get('q', '').strip()
    gender_filter = request.GET.get('gender', '').strip()
    blood_filter = request.GET.get('blood', '').strip()

    patients = tblClient.objects.select_related('userID').order_by('-clientID')

    if query:
        patients = patients.filter(
            Q(name__icontains=query) |
            Q(userID__email__icontains=query)
        )
    if gender_filter:
        patients = patients.filter(gender__iexact=gender_filter)
    if blood_filter:
        patients = patients.filter(bloodGroup__iexact=blood_filter)

    context = {
        'patients': patients,
        'query': query,
        'gender_filter': gender_filter,
        'blood_filter': blood_filter,
        'total_count': patients.count(),
    }
    return render(request, 'customadmin/admin_patients.html', context)


@admin_login_required
def admin_appointments(request):
    query = request.GET.get('q', '').strip()
    status_filter = request.GET.get('status', '').strip()
    date_from = request.GET.get('date_from', '').strip()
    date_to = request.GET.get('date_to', '').strip()

    appointments = tblAppointment.objects.select_related(
        'clientID', 'doctorID'
    ).order_by('-appointmentDate', '-appointmentTime')

    if query:
        appointments = appointments.filter(
            Q(clientID__name__icontains=query) |
            Q(doctorID__displayName__icontains=query)
        )
    if status_filter == 'pending':
        appointments = appointments.filter(isAccepted=False, isRejected=False)
    elif status_filter == 'accepted':
        appointments = appointments.filter(isAccepted=True)
    elif status_filter == 'rejected':
        appointments = appointments.filter(isRejected=True)

    if date_from:
        appointments = appointments.filter(appointmentDate__gte=date_from)
    if date_to:
        appointments = appointments.filter(appointmentDate__lte=date_to)

    context = {
        'appointments': appointments,
        'query': query,
        'status_filter': status_filter,
        'date_from': date_from,
        'date_to': date_to,
        'total_count': appointments.count(),
    }
    return render(request, 'customadmin/admin_appointments.html', context)


@admin_login_required
def admin_reviews(request):
    query = request.GET.get('q', '').strip()
    rating_filter = request.GET.get('rating', '').strip()

    reviews = tblReview.objects.select_related('doctorID', 'userID').order_by('-createdDT')

    if query:
        reviews = reviews.filter(
            Q(doctorID__displayName__icontains=query) |
            Q(userID__userName__icontains=query) |
            Q(review__icontains=query)
        )
    if rating_filter:
        try:
            reviews = reviews.filter(rating=int(rating_filter))
        except ValueError:
            pass

    context = {
        'reviews': reviews,
        'query': query,
        'rating_filter': rating_filter,
        'total_count': reviews.count(),
    }
    return render(request, 'customadmin/admin_reviews.html', context)


@admin_login_required
def admin_blogs(request):
    query = request.GET.get('q', '').strip()

    blogs = tblDoctorPost.objects.select_related('doctorID').order_by('-createDT')

    if query:
        blogs = blogs.filter(
            Q(title__icontains=query) |
            Q(doctorID__displayName__icontains=query) |
            Q(description__icontains=query)
        )

    context = {
        'blogs': blogs,
        'query': query,
        'total_count': blogs.count(),
    }
    return render(request, 'customadmin/admin_blogs.html', context)


@admin_login_required
def admin_categories(request):
    categories = tblCategory.objects.all().order_by('categoryName')
    subcategories = tblSubcategory.objects.select_related('CategoryID').all().order_by('subcategoryName')

    context = {
        'categories': categories,
        'subcategories': subcategories,
    }
    return render(request, 'customadmin/admin_categories.html', context)


@admin_login_required
def admin_locations(request):
    states = tblState.objects.all().order_by('stateName')
    cities = tblCity.objects.select_related('stateID').all().order_by('cityName')

    context = {
        'states': states,
        'cities': cities,
    }
    return render(request, 'customadmin/admin_locations.html', context)


# ═══════════════════════════════════════════════════════════════
#  DELETE ENDPOINTS (AJAX)
# ═══════════════════════════════════════════════════════════════

@admin_login_required
@require_POST
def admin_user_delete(request, id):
    try:
        user = tblUser.objects.get(userID=id)
        user.delete()
        return JsonResponse({'status': 'success', 'message': 'User deleted successfully.'})
    except tblUser.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found.'}, status=404)


@admin_login_required
@require_POST
def admin_doctor_delete(request, id):
    try:
        doctor = tblDoctor.objects.get(doctorID=id)
        doctor.delete()
        return JsonResponse({'status': 'success', 'message': 'Doctor deleted successfully.'})
    except tblDoctor.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Doctor not found.'}, status=404)


@admin_login_required
@require_POST
def admin_patient_delete(request, id):
    try:
        patient = tblClient.objects.get(clientID=id)
        patient.delete()
        return JsonResponse({'status': 'success', 'message': 'Patient deleted successfully.'})
    except tblClient.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Patient not found.'}, status=404)


@admin_login_required
@require_POST
def admin_appointment_delete(request, id):
    try:
        appointment = tblAppointment.objects.get(appointmentID=id)
        appointment.delete()
        return JsonResponse({'status': 'success', 'message': 'Appointment deleted successfully.'})
    except tblAppointment.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Appointment not found.'}, status=404)


@admin_login_required
@require_POST
def admin_blog_delete(request, id):
    try:
        blog = tblDoctorPost.objects.get(doctorPostID=id)
        blog.delete()
        return JsonResponse({'status': 'success', 'message': 'Blog deleted successfully.'})
    except tblDoctorPost.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Blog not found.'}, status=404)


@admin_login_required
@require_POST
def admin_review_delete(request, id):
    try:
        review = tblReview.objects.get(reviewID=id)
        review.delete()
        return JsonResponse({'status': 'success', 'message': 'Review deleted successfully.'})
    except tblReview.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Review not found.'}, status=404)


@admin_login_required
@require_POST
def admin_category_delete(request, id):
    try:
        category = tblCategory.objects.get(categoryID=id)
        category.delete()
        return JsonResponse({'status': 'success', 'message': 'Category deleted successfully.'})
    except tblCategory.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Category not found.'}, status=404)


@admin_login_required
@require_POST
def admin_subcategory_delete(request, id):
    try:
        subcategory = tblSubcategory.objects.get(subcategoryID=id)
        subcategory.delete()
        return JsonResponse({'status': 'success', 'message': 'Subcategory deleted successfully.'})
    except tblSubcategory.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Subcategory not found.'}, status=404)


@admin_login_required
@require_POST
def admin_state_delete(request, id):
    try:
        state = tblState.objects.get(stateID=id)
        state.delete()
        return JsonResponse({'status': 'success', 'message': 'State deleted successfully.'})
    except tblState.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'State not found.'}, status=404)


@admin_login_required
@require_POST
def admin_city_delete(request, id):
    try:
        city = tblCity.objects.get(cityID=id)
        city.delete()
        return JsonResponse({'status': 'success', 'message': 'City deleted successfully.'})
    except tblCity.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'City not found.'}, status=404)


# ═══════════════════════════════════════════════════════════════
#  ADD ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@admin_login_required
@require_POST
def admin_category_add(request):
    name = request.POST.get('categoryName', '').strip()
    if name:
        tblCategory.objects.create(categoryName=name)
    return redirect('customadmin:admin_categories')


@admin_login_required
@require_POST
def admin_subcategory_add(request):
    name = request.POST.get('subcategoryName', '').strip()
    cat_id = request.POST.get('categoryID', '').strip()
    if name and cat_id:
        try:
            category = tblCategory.objects.get(categoryID=cat_id)
            tblSubcategory.objects.create(subcategoryName=name, CategoryID=category)
        except tblCategory.DoesNotExist:
            pass
    return redirect('customadmin:admin_categories')


@admin_login_required
@require_POST
def admin_state_add(request):
    name = request.POST.get('stateName', '').strip()
    if name:
        tblState.objects.create(stateName=name)
    return redirect('customadmin:admin_locations')


@admin_login_required
@require_POST
def admin_city_add(request):
    name = request.POST.get('cityName', '').strip()
    state_id = request.POST.get('stateID', '').strip()
    if name and state_id:
        try:
            state = tblState.objects.get(stateID=state_id)
            tblCity.objects.create(cityName=name, stateID=state)
        except tblState.DoesNotExist:
            pass
    return redirect('customadmin:admin_locations')
