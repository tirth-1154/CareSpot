from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.db.models import Count, Avg, Q
from django.views.decorators.http import require_POST
from datetime import datetime, timedelta, date
from user.models import (
    tblUser, tblDoctor, tblClient, tblAppointment, tblReview,
    tblDoctorPost, tblCategory, tblSubcategory, tblState, tblCity,
    tblchat, tblnotification, tblFollow, tblComments, tblclientHistory, tblSupportTicket
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

    import json
    from django.core.serializers.json import DjangoJSONEncoder

    top_docs_list = []
    for doc in top_doctors:
        pic_url = doc.userID.profilePic.url if (doc.userID and doc.userID.profilePic) else ''
        top_docs_list.append({
            'doctorID': doc.doctorID,
            'displayName': doc.displayName,
            'subcategory': doc.subcategoryID.subcategoryName if doc.subcategoryID else 'General',
            'profilePicUrl': pic_url,
            'avg_rating': round(doc.avg_rating, 1) if doc.avg_rating else 0.0,
            'review_count': doc.review_count,
        })

    recent_appts_list = []
    for app in recent_appointments:
        recent_appts_list.append({
            'appointmentID': app.appointmentID,
            'patientName': app.clientID.name if app.clientID else 'Unknown',
            'doctorName': app.doctorID.displayName if app.doctorID else 'Unknown',
            'date': app.appointmentDate.strftime('%b %d, %Y') if app.appointmentDate else '',
            'time': app.appointmentTime.strftime('%I:%M %p') if app.appointmentTime else '',
            'status': 'Accepted' if app.isAccepted else ('Rejected' if app.isRejected else 'Pending')
        })

    dashboard_data = {
        'stats': {
            'totalDoctors': total_doctors,
            'totalPatients': total_patients,
            'totalAppointments': total_appointments,
            'totalReviews': total_reviews,
            'totalUsers': total_users,
            'totalBlogs': total_blogs,
            'todayAppointments': today_appointments,
            'pendingAppointments': pending_appointments,
            'acceptedAppointments': accepted_appointments,
            'rejectedAppointments': rejected_appointments,
            'avgRating': avg_rating,
        },
        'topDoctors': top_docs_list,
        'recentAppointments': recent_appts_list,
    }

    context = {
        'total_doctors': total_doctors,
        'total_patients': total_patients,
        'total_appointments': total_appointments,
        'today_appointments': today_appointments,
        'avg_rating': avg_rating,
        'total_reviews': total_reviews,
        'top_doctors': top_doctors,
        'recent_appointments': recent_appointments,
        'dashboard_data_json': json.dumps(dashboard_data, cls=DjangoJSONEncoder)
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

    user_list = []
    for u in users:
        user_list.append({
            'userID': u.userID,
            'userName': u.userName,
            'email': u.email,
            'mobileNumber': u.mobileNumber,
            'IsDoctor': u.IsDoctor,
            'registrationDate': u.registrationDT.strftime('%b %d, %Y') if u.registrationDT else '',
            'registrationTime': u.registrationDT.strftime('%I:%M %p') if u.registrationDT else ''
        })

    import json
    from django.core.serializers.json import DjangoJSONEncoder

    page_data = {
        'users': user_list,
        'query': query,
        'role_filter': role_filter,
        'total_count': users.count(),
        'page_title': 'User Management',
    }

    context = {
        'page_title': 'Users | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    return render(request, 'customadmin/admin_react_root.html', context)


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
    subcats_list = [{'id': c.subcategoryID, 'name': c.subcategoryName} for c in subcategories]
    
    docs_list = []
    for d in doctors:
        docs_list.append({
            'doctorID': d.doctorID,
            'displayName': d.displayName,
            'email': d.userID.email if d.userID else '',
            'profilePicUrl': d.userID.profilePic.url if (d.userID and d.userID.profilePic) else '',
            'subcategory': d.subcategoryID.subcategoryName if d.subcategoryID else 'General',
            'displayContact': d.displayContact,
            'yearOfExperience': d.yearOfExperience,
            'mode': d.mode, # 1=online, 2=offline, 3=both
            'approval_status': d.approval_status,
            'avg_rating': round(d.avg_rating, 1) if d.avg_rating else 0.0,
            'review_count': d.review_count,
            'patient_count': d.patient_count,
        })

    import json
    from django.core.serializers.json import DjangoJSONEncoder
    
    page_data = {
        'doctors': docs_list,
        'subcategories': subcats_list,
        'query': query,
        'spec_filter': spec_filter,
        'total_count': doctors.count(),
        'page_title': 'Doctors Directory',
    }
    
    context = {
        'page_title': 'Doctors | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    return render(request, 'customadmin/admin_react_root.html', context)


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

    from datetime import date
    today = date.today()
    
    patient_list = []
    for p in patients:
        # Calculate age
        age = 0
        if p.dob:
            age = today.year - p.dob.year - ((today.month, today.day) < (p.dob.month, p.dob.day))
            
        patient_list.append({
            'clientID': p.clientID,
            'name': p.name,
            'email': p.userID.email if p.userID else '',
            'avatarLetter': p.name.upper()[0] if p.name else 'P',
            'contactNo': p.userID.mobileNumber if p.userID else '',
            'gender': p.gender,
            'age': age,
            'bloodGroup': p.bloodGroup,
            'address': p.address,
        })

    import json
    from django.core.serializers.json import DjangoJSONEncoder

    page_data = {
        'patients': patient_list,
        'query': query,
        'gender_filter': gender_filter,
        'blood_filter': blood_filter,
        'total_count': patients.count(),
        'page_title': 'Patients Directory',
    }

    context = {
        'page_title': 'Patients | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    return render(request, 'customadmin/admin_react_root.html', context)


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

    appt_list = []
    for app in appointments:
        appt_list.append({
            'appointmentID': app.appointmentID,
            'clientName': app.clientID.name if app.clientID else 'Unknown',
            'clientPicUrl': app.clientID.userID.profilePic.url if (app.clientID and app.clientID.userID and app.clientID.userID.profilePic) else '',
            'doctorName': app.doctorID.displayName if app.doctorID else 'Unknown',
            'doctorSubcategory': app.doctorID.subcategoryID.subcategoryName if (app.doctorID and app.doctorID.subcategoryID) else '',
            'doctorPicUrl': app.doctorID.userID.profilePic.url if (app.doctorID and app.doctorID.userID and app.doctorID.userID.profilePic) else '',
            'appointmentDate': app.appointmentDate.strftime('%b %d, %Y') if app.appointmentDate else '',
            'appointmentTime': app.appointmentTime.strftime('%I:%M %p') if app.appointmentTime else '',
            'isAccepted': app.isAccepted,
            'isRejected': app.isRejected,
            'createdDT': app.createdDT.strftime('%b %d, %Y') if app.createdDT else '',
        })

    import json
    from django.core.serializers.json import DjangoJSONEncoder

    page_data = {
        'appointments': appt_list,
        'query': query,
        'status_filter': status_filter,
        'date_from': date_from,
        'date_to': date_to,
        'total_count': appointments.count(),
        'page_title': 'Appointments',
    }

    context = {
        'page_title': 'Appointments | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    return render(request, 'customadmin/admin_react_root.html', context)


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

    review_list = []
    for r in reviews:
        review_list.append({
            'reviewID': r.reviewID,
            'doctorName': r.doctorID.displayName if r.doctorID else 'Unknown',
            'userName': r.userID.userName if r.userID else 'Anonymous',
            'userPicUrl': r.userID.profilePic.url if (r.userID and r.userID.profilePic) else '',
            'rating': r.rating,
            'review': r.review,
            'createdDT': r.createdDT.strftime('%b %d, %Y') if r.createdDT else '',
        })

    import json
    from django.core.serializers.json import DjangoJSONEncoder

    page_data = {
        'reviews': review_list,
        'query': query,
        'rating_filter': rating_filter,
        'total_count': reviews.count(),
        'page_title': 'Patient Reviews',
    }

    context = {
        'page_title': 'Reviews | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    return render(request, 'customadmin/admin_react_root.html', context)


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

    blog_list = []
    for b in blogs:
        blog_list.append({
            'postID': b.doctorPostID,
            'title': b.title,
            'doctorName': b.doctorID.displayName if b.doctorID else 'Unknown',
            'doctorPicUrl': b.doctorID.userID.profilePic.url if (b.doctorID and b.doctorID.userID and b.doctorID.userID.profilePic) else '',
            'description': b.description,
            'createDT': b.createDT.strftime('%b %d, %Y') if b.createDT else '',
        })

    import json
    from django.core.serializers.json import DjangoJSONEncoder

    page_data = {
        'blogs': blog_list,
        'query': query,
        'total_count': blogs.count(),
        'page_title': 'Health Blogs',
    }

    context = {
        'page_title': 'Blogs | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    return render(request, 'customadmin/admin_react_root.html', context)


@admin_login_required
def admin_categories(request):
    cats = tblCategory.objects.all().order_by('categoryName')
    subcats = tblSubcategory.objects.select_related('CategoryID').all().order_by('subcategoryName')

    cat_list = [{'id': c.categoryID, 'name': c.categoryName} for c in cats]
    subcat_list = [{'id': s.subcategoryID, 'name': s.subcategoryName, 'category': s.CategoryID.categoryName if s.CategoryID else ''} for s in subcats]

    import json
    from django.core.serializers.json import DjangoJSONEncoder

    page_data = {
        'page_title': 'Specializations & Categories',
        'categories': cat_list,
        'subcategories': subcat_list,
    }

    context = {
        'page_title': 'Categories | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    return render(request, 'customadmin/admin_react_root.html', context)


@admin_login_required
def admin_locations(request):
    states = tblState.objects.all().order_by('stateName')
    cities = tblCity.objects.select_related('stateID').all().order_by('cityName')

    state_list = [{'id': s.stateID, 'name': s.stateName} for s in states]
    city_list = [{'id': c.cityID, 'name': c.cityName, 'state': c.stateID.stateName if c.stateID else ''} for c in cities]

    import json
    from django.core.serializers.json import DjangoJSONEncoder

    page_data = {
        'page_title': 'Locations Management',
        'states': state_list,
        'cities': city_list,
    }

    context = {
        'page_title': 'Locations | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    return render(request, 'customadmin/admin_react_root.html', context)


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

@admin_login_required
@require_POST
def admin_doctor_approve(request, id):
    try:
        doctor = tblDoctor.objects.get(doctorID=id)
        doctor.approval_status = 'approved'
        doctor.save()
        return JsonResponse({'status': 'success', 'message': 'Doctor approved successfully.'})
    except tblDoctor.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Doctor not found.'}, status=404)

@admin_login_required
@require_POST
def admin_doctor_reject(request, id):
    try:
        doctor = tblDoctor.objects.get(doctorID=id)
        doctor.approval_status = 'rejected'
        doctor.save()
        
        # Send email to doctor
        from django.core.mail import send_mail
        from django.conf import settings
        
        subject = 'Carespot - Doctor Registration Rejected'
        message = f'Hello Dr. {doctor.displayName},\n\nWe regret to inform you that your registration to Carespot has been rejected by the administration.\n\nPlease contact the administrator for more information.\n\nRegards,\nCarespot Team'
        
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [doctor.userID.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f'Failed to send rejection email: {e}')
            
        return JsonResponse({'status': 'success', 'message': 'Doctor rejected and email sent.'})
    except tblDoctor.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Doctor not found.'}, status=404)

@admin_login_required
def admin_support(request):
    query = request.GET.get('q', '').strip()
    status_filter = request.GET.get('status', '').strip()
    
    tickets = tblSupportTicket.objects.select_related('userID').order_by('-createdDT')
    
    if query:
        tickets = tickets.filter(
            Q(name__icontains=query) |
            Q(email__icontains=query) |
            Q(subject__icontains=query)
        )
    if status_filter:
        tickets = tickets.filter(status=status_filter)
        
    ticket_list = []
    for t in tickets:
        ticket_list.append({
            'ticketID': t.ticketID,
            'name': t.name,
            'email': t.email,
            'subject': t.subject,
            'message': t.message,
            'status': t.status,
            'createdDT': t.createdDT.strftime('%b %d, %Y') if t.createdDT else ''
        })
        
    import json
    from django.core.serializers.json import DjangoJSONEncoder
    
    page_data = {
        'tickets': ticket_list,
        'query': query,
        'status_filter': status_filter,
        'total_count': tickets.count(),
        'page_title': 'Support Inquiries',
    }
    
    context = {
        'page_title': 'Support Tickets | Admin',
        'admin_data_json': json.dumps(page_data, cls=DjangoJSONEncoder)
    }
    
    return render(request, 'customadmin/admin_react_root.html', context)

@admin_login_required
@require_POST
def admin_support_update(request, id):
    new_status = request.POST.get('status', '').strip()
    try:
        ticket = tblSupportTicket.objects.get(ticketID=id)
        if new_status in dict(ticket.STATUS_CHOICES):
            ticket.status = new_status
            ticket.save()
            return JsonResponse({'status': 'success', 'message': 'Ticket status updated.'})
        return JsonResponse({'status': 'error', 'message': 'Invalid status.'})
    except tblSupportTicket.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Ticket not found.'}, status=404)
