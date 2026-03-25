<<<<<<< HEAD
=======

>>>>>>> 6af4cdee00948f199f3b5d2c548afb99007405cc
from django.shortcuts import render,redirect
from django.views.decorators.cache import never_cache
from django.db.models import Avg, Count
from datetime import datetime as dt, date
import datetime
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from . models import *
import razorpay

from django.core.mail import send_mail
from django.conf import settings
import random
from django.contrib import messages
from django.utils import timezone
from datetime import timedelta

def home(request):
    user_id = request.session.get('user_id')

    is_following_anyone = False
    user = None
    c = None
    is_patient = False

    if user_id:
        user = tblUser.objects.filter(userID=user_id).first()
        if user:
            c = tblClient.objects.filter(userID=user.userID).first()
            if c:
                is_patient = True

    if is_patient:
        # User jo doctors ko follow karta hai unki list
        followed = tblFollow.objects.filter(userID=user).values_list('doctorID', flat=True)
        if followed.exists():
            is_following_anyone = True
            blogs = tblDoctorPost.objects.filter(doctorID__in=followed).order_by('-createDT')
        else:
            is_following_anyone = False
            blogs = tblDoctorPost.objects.none()
    else:
        # Doctors or non-logged-in users see all blogs
        blogs = tblDoctorPost.objects.all().order_by('-createDT')

    search_query = request.GET.get('search', '').strip()
    if search_query:
        blogs = blogs.filter(
            models.Q(title__icontains=search_query) |
            models.Q(description__icontains=search_query) |
            models.Q(doctorID__subcategoryID__subcategoryName__icontains=search_query)
        )

    c = None
    is_patient = False
    if user:
        c = tblClient.objects.filter(userID=user.userID).first()
        if c:
            is_patient = True
    if is_patient:
        base_template = 'patient_base.html'
    else:
        base_template = 'base.html'

    trending_blogs = tblDoctorPost.objects.annotate(
        comment_count=Count('tblcomments', distinct=True),
        review_count=Count('doctorID__tblreview', distinct=True)
    ).order_by('-comment_count', '-review_count', '-createDT')[:3]

    data = {
        'blogs': blogs,
        'trending_blogs': trending_blogs,
        'is_following_anyone': is_following_anyone,
        'recent_posts':tblDoctorPost.objects.all().order_by('-createDT')[:5],
        'user':user,
        'client':c,
        'base_template': base_template,
        'is_patient': is_patient,
        'search_query': search_query,
    }
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'home_results_partial.html', data)
        
    return render(request, 'home.html', data)# Create your views here.

def intro(request):
    return render(request, 'Intro.html')

def Login(request):

    # Check if a login animation is pending
    if request.session.pop('show_login_animation', False):
        return render(request, 'Login.html', {
            'login_success': True,
            'role': request.session.pop('login_role', ''),
            'name': request.session.pop('login_name', ''),
            'redirect_url': request.session.pop('login_redirect', '')
        })

    # Agar user pehle se login hai toh dashboard par bhejo
    if request.session.get('user_id'):
        if request.session.get('isDoctor'):
            return redirect(doctorDashboard)
        else:
            return redirect(patientDashboard)

    if request.POST.get('btnLogin'):
        email=request.POST.get('emailaddress')
        password=request.POST.get('password')
        u=tblUser.objects.filter(email=email,password=password).first()

        if u == None:
            data={"msg":"invalid credentials"}
            return render(request,'Login.html',data)
        elif not u.IsDoctor:
            c=tblClient.objects.filter(userID=u).first()
            if c:
                request.session['isDoctor']=False
                request.session['user_id']=u.userID
                request.session['user_name']=u.userName
                request.session['profilePic']=u.profilePic.url
                request.session['email']=u.email
                request.session['clientID']=c.clientID  
                
                from django.urls import reverse
                request.session['show_login_animation'] = True
                request.session['login_role'] = 'Patient'
                request.session['login_name'] = c.name
                request.session['login_redirect'] = reverse('patientDoctorsList')
                return redirect('Login')
            else:
                data={"msg":"Client record not found"}
                return render(request,'Login.html',data)
        else:
            d=tblDoctor.objects.filter(userID=u).first()
            if d:
                request.session['isDoctor']=True
                request.session['user_id']=u.userID
                request.session['user_name']=u.userName
                request.session['profilePic']=u.profilePic.url
                request.session['doctorID']=d.doctorID
                request.session['displayName']=d.displayName
                # request.session['subcategory']=d.subcategoryID.subcategoryName
                
                from django.urls import reverse
                request.session['show_login_animation'] = True
                request.session['login_role'] = 'Doctor'
                request.session['login_name'] = d.displayName
                request.session['login_redirect'] = reverse('doctorDashboard')
                return redirect('Login')
            else:               
                data={"msg":"Doctor record not found"}
                return render(request,'Login.html',data)

    return render(request,'Login.html')

@never_cache
def forgotPassword(request):
    if request.method == 'POST':
        email = request.POST.get('emailaddress')
        user = tblUser.objects.filter(email=email).first()
        
        if user:
            # Generate 6 digit random OTP
            otp_code = str(random.randint(100000, 999999))
            
            # Save OTP in DB
            OTP.objects.create(user=user, otp=otp_code)
            
            # Send Email
            subject = 'Password Reset OTP - CareSpot'
            message = f'Hello {user.userName},\n\nYour OTP for password reset is: {otp_code}\n\nThis OTP is valid for 5 minutes.\n\nRegards,\nCareSpot Team'
            from_email = settings.EMAIL_HOST_USER
            recipient_list = [email]
            
            # HTML Email Template
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }}
                    .email-container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
                    .header {{ text-align: center; padding-bottom: 25px; border-bottom: 2px solid #f0f4f8; }}
                    .header h1 {{ color: #076FC5; margin: 0; font-size: 28px; letter-spacing: 1px; }}
                    .content {{ padding: 30px 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6; }}
                    .otp-card {{ background: linear-gradient(135deg, #f0f7f9 0%, #e8f1f2 100%); border: 2px dashed #076FC5; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0; }}
                    .otp-label {{ font-size: 14px; text-transform: uppercase; color: #718096; font-weight: 600; margin-bottom: 10px; letter-spacing: 1px; }}
                    .otp-code {{ font-size: 42px; font-weight: 800; color: #076FC5; letter-spacing: 8px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.05); }}
                    .warning {{ color: #e53e3e; font-size: 14px; text-align: center; margin-top: 15px; font-weight: 500; }}
                    .footer {{ text-align: center; color: #a0aec0; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f4f8; }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>CareSpot</h1>
                    </div>
                    <div class="content">
                        <p>Hello <strong>{user.userName}</strong>,</p>
                        <p>We received a request to reset the password for your CareSpot account. Please use the verification code below to securely change your password.</p>
                        
                        <div class="otp-card">
                            <div class="otp-label">Your Verification Code</div>
                            <div class="otp-code">{otp_code}</div>
                        </div>
                        
                        <p class="warning">⏳ This OTP is valid for only <strong>5 minutes</strong>. Do not share this code with anyone.</p>
                        <p style="margin-top: 25px;">If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>
                    </div>
                    <div class="footer">
                        <p>Best Regards,<br><strong>CareSpot Security Team</strong></p>
                        <p>&copy; 2026 CareSpot. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            try:
                send_mail(
                    subject, 
                    message, 
                    from_email, 
                    recipient_list,
                    html_message=html_message
                )
                request.session['reset_email'] = email
                messages.success(request, 'OTP sent to your email successfully.')
                return redirect('verifyOTP')
            except Exception as e:
                messages.error(request, 'Failed to send OTP email. Please try again later.')
        else:
            messages.error(request, 'Email address not found.')
            
    return render(request, 'forgot_password.html')

@never_cache
def verifyOTP(request):
    if 'reset_email' not in request.session:
        return redirect('Login')
        
    email = request.session['reset_email']
    
    if request.method == 'POST':
        entered_otp = request.POST.get('otp')
        user = tblUser.objects.filter(email=email).first()
        
        if user:
            # Get latest OTP for user
            latest_otp = OTP.objects.filter(user=user).order_by('-created_at').first()
            
            if latest_otp and latest_otp.otp == entered_otp:
                if latest_otp.is_expired():
                    messages.error(request, 'OTP has expired. Please request a new one.')
                    return redirect('forgotPassword')
                else:
                    request.session['otp_verified'] = True
                    return redirect('resetPassword')
            else:
                messages.error(request, 'Invalid OTP. Please try again.')
                
    return render(request, 'verify_otp.html', {'email': email})

@never_cache
def resetPassword(request):
    if 'reset_email' not in request.session or not request.session.get('otp_verified'):
        return redirect('Login')
        
    if request.method == 'POST':
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        
        if new_password == confirm_password:
            email = request.session['reset_email']
            user = tblUser.objects.filter(email=email).first()
            
            if user:
                user.password = new_password
                user.save()
                
                # Clear session variables
                del request.session['reset_email']
                del request.session['otp_verified']
                
                messages.success(request, 'Password reset successfully. You can now login with your new password.')
                return redirect('Login')
        else:
            messages.error(request, 'Passwords do not match.')
            
    return render(request, 'reset_password.html')

def doctorRegister(request):
    data={
        'cities':tblCity.objects.all(),
        'subcategories':tblSubcategory.objects.all()
    }
    if request.POST.get('btnRegister'):
        name=request.POST.get('uname')
        password=request.POST.get('password')
        datetime=request.POST.get('dob')
        profile=request.FILES.get('profile')
        email=request.POST.get('email')
        contact=request.POST.get('contact')
        city=request.POST.get('city')
        isDoctor= True
        u=tblUser.objects.filter(email=email).first()
        if u:
            data={"msg":"Email already exists"}
            return render(request,'doctor_register.html',data)
        else:
            user=tblUser(None,name,password,datetime,profile,email,contact,city,isDoctor)
            user.save()

            if isDoctor:
                isDoctor = True
                subcategory=request.POST.get('subcategory')
                bio=request.POST.get('bio')
                mode=request.POST.get('mode')
                dname=request.POST.get('displayName')
                dcontact=request.POST.get('displayContact')
                daddress=request.POST.get('displayAddress')
                document=request.FILES.get('document')
                licenseNo=request.POST.get('licenseNo')
                experience=request.POST.get('yearOfExperience')
                d=tblDoctor(None,user.userID,dname,dcontact,bio,subcategory,daddress,experience,licenseNo,document,mode)
                d.save()
                docImage=tblDoctorImages(None,d.doctorID,profile)
                docImage.save()
                
                from django.urls import reverse
                data["register_success"] = True
                data["name"] = name
                data["redirect_url"] = reverse('Login')
                return render(request, 'doctor_register.html', data)
            else:
                isDoctor = False

        return redirect(Login)    
    return render(request,'doctor_register.html',data)

def doctorProfile(request):
    doctor_id=request.session['doctorID']
    blogs=tblDoctorPost.objects.filter(doctorID=doctor_id)
    blog_count=blogs.count()
    doctor = tblDoctor.objects.filter(doctorID=doctor_id).first()
    follower_count = tblFollow.objects.filter(doctorID=doctor).count() if doctor else 0
    review_count = tblReview.objects.filter(doctorID=doctor).count() if doctor else 0
    avg_rating_dict = tblReview.objects.filter(doctorID=doctor).aggregate(Avg('rating'))
    avg_rating = round(avg_rating_dict['rating__avg'] or 0.0, 1)
    if request.method == 'POST' and request.FILES.get('image'):
        image = request.FILES.get('image')
        tblDoctorAttachment.objects.create(doctorID=doctor, attachment=image)
        return redirect(doctorProfile)

    doctor_images = tblDoctorImages.objects.filter(doctorID=doctor_id)
    doctor_attachments = tblDoctorAttachment.objects.filter(doctorID=doctor_id)
    data={
        "blogs":blogs,
        "blog_count":blog_count,
        "follower_count":follower_count,
        "review_count":review_count,
        "avg_rating":avg_rating,
        "doctor_images": doctor_images,
        "doctor_attachments": doctor_attachments
    }
    return render(request,'doctor_profile.html',data)

def doctorPostDetails(request,id):
    # Determine if logged-in user is patient or doctor
    user_id = request.session.get('user_id')
    user = None
    is_patient = False
    if user_id:
        user = tblUser.objects.filter(userID=user_id).first()
        if user:
            c = tblClient.objects.filter(userID=user.userID).first()
            if c:
                is_patient = True
    
    if is_patient:
        base_template = 'patient_base.html'
    else:
        base_template = 'base.html'

    current_post = tblDoctorPost.objects.filter(doctorPostID=id).first()
    related_articles = tblDoctorPost.objects.none()
    if current_post:
        related_articles = tblDoctorPost.objects.filter(doctorID=current_post.doctorID).exclude(doctorPostID=id).order_by('-createDT')[:3]

    data={
        "blogs":tblDoctorPost.objects.filter(doctorPostID=id),
        "related_articles": related_articles,
        'comments':tblComments.objects.filter(doctorPostID=id, parent=None).order_by('-createdDT'),
        'base_template': base_template,
        'is_patient': is_patient,
    }
    if request.POST.get('btnComment'):
        comment=request.POST.get('comment')
        parent_id=request.POST.get('parent_id')
        user_id=request.session['user_id']
        post=tblDoctorPost.objects.filter(doctorPostID=id).first()
        user=tblUser.objects.filter(userID=user_id).first()
        if user_id:
            parent_obj=None
            if parent_id:
                parent_obj=tblComments.objects.filter(commentsID=parent_id).first()
            new_comment=tblComments(
                comment=comment,
                userID=user,
                doctorPostID=post,
                parent=parent_obj
            )
            new_comment.save()
            return redirect('doctorPostDetails', id=id)
    return render(request,'doctor_post_details.html',data)

def doctorPostAdd(request):
    if request.POST.get('btnAddBlog'):
        title=request.POST.get('title')
        description=request.POST.get('description')
        profile=request.FILES.get('profile')
        
        user_id=request.session['user_id']
        if user_id:
            try:
                doctor=tblDoctor.objects.filter(userID=user_id).first()
                post=tblDoctorPost(None,doctor.doctorID,title,description,profile)
                post.save()
                return redirect('doctorPostDetails', id=post.doctorPostID)
            except:
                print("Doctor not found")
    data={
        'blogs':tblDoctorPost.objects.all()
    }
    return render(request,'doctor_post_add.html',data)

def patientRegister(request):
    data={
        'cities':tblCity.objects.all()
    }
    if request.POST.get('btnPRegister'):
        name=request.POST.get('uname')
        password=request.POST.get('password')
        profile=request.FILES.get('profile')
        email=request.POST.get('email')
        contact=request.POST.get('contact')
        city=request.POST.get('city')
        isDoctor= False
        u=tblUser.objects.filter(email=email).first()
        if u:
            data={"msg":"Email already exists"}
            return render(request,'pateient_register.html',data)
        else:
            user=tblUser(None,name,password,None,profile,email,contact,city,isDoctor)
            user.save()

            if isDoctor == False:
                desc=request.POST.get('description')
                dob=request.POST.get('dob')
                gender=request.POST.get('gender')
                bloodGroup=request.POST.get('bloodGroup')
                address=request.POST.get('address')
                patient=tblClient(None,user.userID,name,desc,address,dob,gender,bloodGroup)
                patient.save()
                
                from django.urls import reverse
                data["register_success"] = True
                data["name"] = name
                data["redirect_url"] = reverse('Login')
                return render(request, 'pateient_register.html', data)
    return render(request,'pateient_register.html',data)

def logout(request):
    user_id = request.session.get('user_id')
    if user_id:
        tblUser.objects.filter(userID=user_id).update(last_seen=None)
    request.session.flush()
    return redirect(Login)

def doctorSearch(request):
    if 'user_id' not in request.session:
        return redirect('Login')
    
    query = request.POST.get('q', '') or request.GET.get('q', '')
    city_id = request.POST.get('city', '') or request.GET.get('city', '')
    subcategory_id = request.POST.get('subcategory', '') or request.GET.get('subcategory', '')
    rating_filter = request.POST.get('rating', '') or request.GET.get('rating', '')
    doctors = tblDoctor.objects.filter(approval_status='approved')
    
    logged_in_user_id = request.session.get('user_id')
    if logged_in_user_id:
        logged_in_doctor = tblDoctor.objects.filter(userID=logged_in_user_id).first()
        if logged_in_doctor:
            doctors = doctors.exclude(doctorID=logged_in_doctor.doctorID)
            
    
    if query:
        doctors = doctors.filter(displayName__icontains=query)
    
    if city_id:
        doctors = doctors.filter(userID__cityID=city_id)
        
    if subcategory_id:
        doctors = doctors.filter(subcategoryID=subcategory_id)

    # Annotate doctors with their average rating
    doctors = doctors.annotate(avg_rating=Avg('tblreview__rating'))

    if rating_filter:
        try:
            rating_val = float(rating_filter)
            # Filter where avg_rating is not None AND >= rating_val
            doctors = doctors.filter(avg_rating__isnull=False, avg_rating__gte=rating_val)
        except ValueError:
            pass
    
    data = {
        'doctors': doctors,
        'query': query,
        'selected_city': city_id,
        'selected_cat': subcategory_id,
        'selected_rating': rating_filter,
        'cities': tblCity.objects.all(),
        'subcategories': tblSubcategory.objects.all()
    }
    return render(request, 'doctor_search.html', data)
def followDoctor(request, id):
    if 'user_id' not in request.session:
        return redirect('Login')

    user_id = request.session['user_id']
    user = tblUser.objects.filter(userID=user_id).first()
    doctor = tblDoctor.objects.filter(doctorID=id).first()

    if user and doctor:
        existing = tblFollow.objects.filter(userID=user, doctorID=doctor).first()
        if existing:
            existing.delete()   # Unfollow
        else:
            tblFollow.objects.create(userID=user, doctorID=doctor)  # Follow

    return redirect('home')

def viewDoctorProfile(request, id):
    user_id = request.session.get('user_id')
    doctor = tblDoctor.objects.filter(doctorID=id).first()
    doctor_attachments = tblDoctorAttachment.objects.filter(doctorID=id)
    
    # Check if user has already reviewed this doctor
    has_reviewed = False
    if user_id:
        has_reviewed = tblReview.objects.filter(doctorID=id, userID=user_id).exists()
    
    if request.POST.get('btnReview'):
        if not has_reviewed:
            review_text = request.POST.get('message')
            rating = request.POST.get('rating')
            r = tblReview(doctorID_id=id, userID_id=user_id, rating=rating, review=review_text)
            r.save()
            return redirect('viewDoctorProfile', id=id)
    
    rating=tblReview.objects.filter(doctorID=id, userID=user_id).first()
    
    # Calculate average rating
    avg_rating_dict = tblReview.objects.filter(doctorID=id).aggregate(Avg('rating'))
    avg_rating = avg_rating_dict['rating__avg'] or 0.0


    user_id = request.session['user_id']
    user = tblUser.objects.filter(userID=user_id).first()
    is_followed = False
    if user and doctor:
        is_followed = tblFollow.objects.filter(userID=user, doctorID=doctor).exists()

    follower_count = tblFollow.objects.filter(doctorID=doctor).count() if doctor else 0

    # Check if logged-in user is the doctor themselves
    is_own_profile = request.session.get('isDoctor') and request.session.get('doctorID') == id

    blogs = tblDoctorPost.objects.filter(doctorID=id).order_by('-createDT')
    blog_count = blogs.count()
    
    # Get posts that have a thumbnail image
    image_posts = blogs.exclude(thumbnail='')

    reviews_qs = tblReview.objects.filter(doctorID=id).order_by('-createdDT')
    review_count = reviews_qs.count()

    doctor_images = tblDoctorImages.objects.filter(doctorID=id)
    data = {
        "doctor": doctor,
        "blogs": blogs,
        "image_posts": image_posts,
        "reviews": reviews_qs,
        "is_followed": is_followed,
        "follower_count": follower_count,
        "is_own_profile": is_own_profile,
        "blog_count": blog_count,
        "has_reviewed": has_reviewed,
        "avg_rating": round(avg_rating, 1), # rounding to 1 decimal place
        "review_count": review_count,
        "doctor_images": doctor_images,
        "doctor_attachments": doctor_attachments
    }

    # Determine base template based on whether viewer is a logged-in patient or doctor
    is_patient = False
    base_template = 'base.html'  # Default for doctors or non-logged individuals
    
    if request.session.get('user_id'):
        if request.session.get('isDoctor') == False:
            # Explicitly checking for False ensures it's a patient session
            is_patient = True
            base_template = 'patient_base.html'

    data.update({
        'base_template': base_template,
        'is_patient': is_patient
    })

    return render(request, 'patient_view_profile.html', data)

def doctorUpdateProfile(request):
    if 'user_id' not in request.session:
        return redirect('Login')
    
    user_id = request.session['user_id']
    user = tblUser.objects.filter(userID=user_id).first()
    doctor = tblDoctor.objects.filter(userID=user_id).first()
    subcategories = tblSubcategory.objects.all()
    
    if request.POST.get('btnUpdate'):
        # 1. Update User related fields
        user.email = request.POST.get('email')
        
        # Handle Profile Picture
        profile = request.FILES.get('profile')
        if profile:
            user.profilePic = profile
            user.save()
            # Update session with new profile pic url
            request.session['profilePic'] = user.profilePic.url
        else:
            user.save()
            
        # 2. Update Doctor related fields
        doctor.displayName = request.POST.get('displayName')
        doctor.displayContact = request.POST.get('contact')
        doctor.displayAddress = request.POST.get('address')
        doctor.bio = request.POST.get('bio')
        
        # Update Consultation Fees
        fees = request.POST.get('consultationFees')
        if fees:
            try:
                doctor.consultationFees = float(fees)
            except ValueError:
                pass
        
        # Update Specialization
        sc_id = request.POST.get('subcategory')
        if sc_id:
            sc_obj = tblSubcategory.objects.filter(subcategoryID=sc_id).first()
            if sc_obj:
                doctor.subcategoryID = sc_obj
        
        doctor.save()
        
        # Update session with new display name
        request.session['displayName'] = doctor.displayName
        
        return redirect('doctorProfile')
    
    data = {
        "user": user,
        "doctor": doctor,
        "subcategories": subcategories
    }
    return render(request,'doctor_update_profile.html',data)

def doctorDashboard(request):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    doctor_id = request.session['doctorID']
    user_id = request.session['user_id']
    doctor = tblDoctor.objects.filter(doctorID=doctor_id).first()

    today = date.today()

    # All appointments for this doctor
    all_appointments = tblAppointment.objects.filter(doctorID=doctor_id)

    # Today's appointments
    today_appointments = all_appointments.filter(appointmentDate=today).order_by('appointmentTime')
    todays_appointments_count = today_appointments.count()

    # Total unique patients
    total_patients_count = all_appointments.values('clientID').distinct().count()

    # Upcoming (accepted) appointments — exclude past dates AND past times for today
    now_time = dt.now().time()
    upcoming_filter = models.Q(appointmentDate__gt=today) | models.Q(appointmentDate=today, appointmentTime__gte=now_time)
    upcoming_appointments_count = all_appointments.filter(upcoming_filter, isAccepted=True).count()
    upcoming_appointments = all_appointments.filter(upcoming_filter, isAccepted=True).order_by('appointmentDate', 'appointmentTime')[:5]

    # Completed appointments
    completed_appointments_count = all_appointments.filter(isAccepted=True).count()

    # Recent patients — unique clients from all appointments, most recent first
    recent_client_ids = (
        all_appointments.order_by('-appointmentDate', '-appointmentTime')
        .values_list('clientID', flat=True)
    )
    seen = set()
    unique_client_ids = []
    for cid in recent_client_ids:
        if cid not in seen:
            seen.add(cid)
            unique_client_ids.append(cid)
        if len(unique_client_ids) >= 5:
            break
    recent_patients = [tblClient.objects.filter(clientID=cid).first() for cid in unique_client_ids]

    # Doctor's notifications (from their user account)
    notifications = tblnotification.objects.filter(userID=user_id).order_by('-createdDT')[:5]

    # Weekly schedule
    weekly_schedule = tblDoctorSchedule.objects.filter(doctorID=doctor_id).order_by('day_of_week')
    today_weekday = today.weekday()  # 0=Monday … 6=Sunday

    data = {
        "doctor": doctor,
        "today_appointments": today_appointments,
        "todays_appointments_count": todays_appointments_count,
        "total_patients_count": total_patients_count,
        "upcoming_appointments_count": upcoming_appointments_count,
        "upcoming_appointments": upcoming_appointments,
        "completed_appointments_count": completed_appointments_count,
        "recent_patients": recent_patients,
        "notifications": notifications,
        "weekly_schedule": weekly_schedule,
        "today_weekday": today_weekday,
    }

    return render(request, 'doctor_dashboard.html', data)

def doctorAppointments(request):
    if 'doctorID' not in request.session:
        return redirect('Login')
    doctor_id=request.session['doctorID']
    today = date.today()
    now_time = dt.now().time()
    # Only show future appointments (future date OR today with time still ahead)
    future_filter = models.Q(appointmentDate__gt=today) | models.Q(appointmentDate=today, appointmentTime__gte=now_time)
    appointments = tblAppointment.objects.filter(future_filter, doctorID=doctor_id).order_by('isRejected', 'isAccepted', '-appointmentID')
    data={
        "doctor":tblDoctor.objects.filter(doctorID=doctor_id).first(),
        "Appointments":appointments
    }        
    return render(request,'doctor_myAppointments.html',data)

def acceptAppointment(request, id):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    appointment = tblAppointment.objects.filter(appointmentID=id).first()
    if appointment:
        appointment.isAccepted = True
        appointment.isRejected = False
        appointment.save()
        
        # Define variables first (needed for both Meet email and notification)
        doctor = appointment.doctorID
        patient_user = appointment.clientID.userID
        app_date = appointment.appointmentDate.strftime("%b %d, %Y")
        app_time = appointment.appointmentTime.strftime("%I:%M %p")
        
        # Generate Meet link and send Email if mode is online
        if appointment.mode == 'online':
            import string
            # Generate unique Jitsi Meet room (works instantly - no API needed)
            def get_random_string(length):
                return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
            room_id = f"CareSpot-{doctor.displayName.replace(' ', '')}-{appointment.appointmentID}-{get_random_string(6)}"
            meet_link = f"https://meet.jit.si/{room_id}"
            appointment.meetLink = meet_link
            appointment.save()

            # Prepare Email
            subject = f"Online Appointment Confirmed - CareSpot"
            
            # Plain text fallback
            email_msg = f"Hello,\n\nYour online appointment has been confirmed.\n\n"
            email_msg += f"Date: {app_date}\nTime: {app_time}\n"
            email_msg += f"Doctor: Dr. {doctor.displayName}\nPatient: {appointment.clientID.name}\n\n"
            email_msg += f"Join your video consultation here:\n{meet_link}\n\n"
            email_msg += f"Please join the meeting at or just before the scheduled time.\nBoth doctor and patient should click the same link to connect.\n\n"
            email_msg += f"Thank you,\nCareSpot Team"
            
            # HTML Email Body
            html_message = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0; font-size: 24px;">CareSpot</h2>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Online Consultation Confirmed</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        <p style="font-size: 16px; color: #333;">Hello,</p>
                        <p style="font-size: 16px; color: #333; line-height: 1.5;">Your online video consultation has been successfully scheduled and confirmed.</p>
                        
                        <div style="background-color: #f8fbff; border-left: 4px solid #0d6efd; padding: 15px; margin: 25px 0; border-radius: 4px;">
                            <p style="margin: 0 0 10px; font-size: 15px;"><strong>Patient:</strong> {appointment.clientID.name}</p>
                            <p style="margin: 0 0 10px; font-size: 15px;"><strong>Doctor:</strong> {doctor.displayName}</p>
                            <p style="margin: 0 0 10px; font-size: 15px;"><strong>Date:</strong> {app_date}</p>
                            <p style="margin: 0; font-size: 15px;"><strong>Time:</strong> {app_time}</p>
                        </div>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="{meet_link}" style="background-color: #198754; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">
                                Join Video Meeting
                            </a>
                            <p style="margin-top: 15px; font-size: 13px; color: #6c757d;">Or copy this link: <br>{meet_link}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; line-height: 1.5;"><strong>Instructions:</strong><br>Please join the meeting at or just before the scheduled time. Both the doctor and patient will use the same link to connect.</p>
                        
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eee;">
                        <p style="margin: 0; font-size: 13px; color: #999;">Thank you for using CareSpot.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            try:
                # Send to both Doctor and Patient
                recipient_list = [doctor.userID.email, patient_user.email]
                send_mail(
                    subject,
                    email_msg,
                    settings.EMAIL_HOST_USER,
                    recipient_list,
                    fail_silently=True,
                    html_message=html_message
                )
            except Exception as e:
                print(f"Failed to send email: {e}")
                
        # Create a notification for the patient
        message = f"Dr. {doctor.displayName} accepted your appointment on {app_date} at {app_time}."
        
        tblnotification.objects.create(
            userID=patient_user,
            senderID=doctor.userID.userID,
            message=message,
            isRead=False
        )
    
    return redirect('doctorAppointments')

def rejectAppointment(request, id):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    appointment = tblAppointment.objects.filter(appointmentID=id).first()
    if appointment:
        appointment.isAccepted = False
        appointment.isRejected = True
        appointment.save()

        # Create a notification for the patient
        doctor = appointment.doctorID
        patient_user = appointment.clientID.userID
        app_date = appointment.appointmentDate.strftime("%b %d, %Y")
        message = f"{doctor.displayName} rejected your appointment request for {app_date}."
        
        tblnotification.objects.create(
            userID=patient_user,
            senderID=doctor.userID.userID,
            message=message,
            isRead=False
        )
    
    return redirect('doctorAppointments')

def patientDashboard(request):
    if 'user_id' not in request.session:
        return redirect('Login')
    
    user_id = request.session.get('user_id')
    is_following_anyone = False
    blogs = tblDoctorPost.objects.none()

    if user_id:
        user = tblUser.objects.filter(userID=user_id).first()
        if user:
            # Get list of doctor IDs that this user follows
            followed_doctor_ids = tblFollow.objects.filter(userID=user).values_list('doctorID', flat=True)
            if followed_doctor_ids.exists():
                is_following_anyone = True
                blogs = tblDoctorPost.objects.filter(doctorID__in=followed_doctor_ids).order_by('-createDT')
            else:
                is_following_anyone = False
                blogs = tblDoctorPost.objects.none()
    else:
        blogs = tblDoctorPost.objects.none()

    data = {
        'blogs': blogs,
        'is_following_anyone': is_following_anyone,
        'recent_posts': tblDoctorPost.objects.all().order_by('-createDT')[:5]
    }
    return render(request, 'patient_dashboard.html', data)

def patientDoctorsList(request):   
    search_query = request.GET.get('search_query', '').strip()
    subcategory_id = request.GET.get('subcategory', '').strip()
    city_id = request.GET.get('city', '').strip()
    experience_filter = request.GET.get('experience', '').strip()
    rating_filter = request.GET.get('rating', '').strip()
    mode_filter = request.GET.get('mode', '').strip()
    sort_by = request.GET.get('sort', '').strip()
    
    doctors = tblDoctor.objects.filter(approval_status='approved')
    
    # Search query filter — name, specialization, city, bio
    if search_query:
        doctors = doctors.filter(
            models.Q(displayName__icontains=search_query) |
            models.Q(subcategoryID__subcategoryName__icontains=search_query) |
            models.Q(userID__cityID__cityName__icontains=search_query) |
            models.Q(bio__icontains=search_query)
        )
    
    # Subcategory (Specialization) filter
    if subcategory_id:
        doctors = doctors.filter(subcategoryID=subcategory_id)
    
    # City filter
    if city_id:
        doctors = doctors.filter(userID__cityID=city_id)
    
    # Experience filter
    if experience_filter:
        if experience_filter == '1-5':
            doctors = doctors.filter(yearOfExperience__gte=1, yearOfExperience__lte=5)
        elif experience_filter == '5-10':
            doctors = doctors.filter(yearOfExperience__gte=5, yearOfExperience__lte=10)
        elif experience_filter == '10+':
            doctors = doctors.filter(yearOfExperience__gte=10)
    
    # Mode filter (1=Online, 2=Offline, 3=Both)
    if mode_filter:
        try:
            doctors = doctors.filter(mode=int(mode_filter))
        except ValueError:
            pass
    
    # Annotate average rating for each doctor
    doctors = doctors.annotate(avg_rating=Avg('tblreview__rating'))
    
    # Rating filter
    if rating_filter:
        try:
            rating_val = float(rating_filter)
            doctors = doctors.filter(avg_rating__isnull=False, avg_rating__gte=rating_val)
        except ValueError:
            pass
    
    # Sorting
    if sort_by == 'rating':
        doctors = doctors.order_by('-avg_rating')
    elif sort_by == 'experience':
        doctors = doctors.order_by('-yearOfExperience')
    else:
        doctors = doctors.order_by('-avg_rating')
    
    data = {
        "doctors": doctors,
        "search_query": search_query,
        "subcategories": tblSubcategory.objects.all(),
        "cities": tblCity.objects.all(),
        "selected_subcategory": subcategory_id,
        "selected_city": city_id,
        "selected_experience": experience_filter,
        "selected_rating": rating_filter,
        "selected_mode": mode_filter,
        "selected_sort": sort_by,
    }
    return render(request, 'patient_search_doctors.html', data)
    
def patientAppointments(request):
    if 'user_id' not in request.session:
        return redirect('Login')
    
    if request.POST.get('btnBook'):
        user_id=request.session['user_id']
        c=tblClient.objects.filter(userID=user_id).first()
        doctor_id = request.POST.get('doctor')
        date = request.POST.get('app_date')
        time = request.POST.get('time_slot')
        mode = request.POST.get('appointment_mode', 'offline')
        payment_method = request.POST.get('payment_method', 'cash')  # 'razorpay' or 'cash'

        time_slot=dt.strptime(time, '%H:%M').time()
        doctor = tblDoctor.objects.filter(doctorID=doctor_id).first()
        
        p=tblAppointment(
            clientID=c,
            doctorID=doctor,
            appointmentDate=date,
            appointmentTime=time_slot,
            mode=mode,
            isAccepted=False,
            isRejected=False
        )
        p.save()
        
        # Calculate fees
        doctor_fees = float(doctor.consultationFees)
        platform_fee = float(settings.PLATFORM_FEE)
        total_amount = doctor_fees + platform_fee
        
        # For online mode, payment MUST be online (razorpay)
        if mode == 'online':
            payment_method = 'razorpay'
        
        # Create payment record
        payment = tblPayment.objects.create(
            appointmentID=p,
            doctorFees=doctor_fees,
            platformFee=platform_fee,
            totalAmount=total_amount,
            paymentMethod=payment_method,
            paymentStatus='cash' if payment_method == 'cash' else 'pending'
        )
        
        # Notify the doctor about the new appointment request
        if doctor:
            app_date = dt.strptime(date, '%Y-%m-%d').strftime("%b %d, %Y")
            app_time = time_slot.strftime("%I:%M %p")
            message = f"New appointment request from {c.name} for {app_date} at {app_time}."
            tblnotification.objects.create(
                userID=doctor.userID,
                message=message,
                isRead=False
            )
        
        # If cash payment, redirect directly
        if payment_method == 'cash':
            return redirect('patientMyAppointments')
        else:
            # Redirect to payment page for online payment
            return redirect('paymentPage', appointment_id=p.appointmentID)
            
    data={
        "doctor":tblDoctor.objects.filter(approval_status='approved'),
        "RAZORPAY_KEY_ID": settings.RAZORPAY_KEY_ID,
        "PLATFORM_FEE": settings.PLATFORM_FEE,
    }        
    return render(request,'patient_book_appointment.html',data)


def doctorReviews(request):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    doctor_id = request.session['doctorID']
    doctor = tblDoctor.objects.filter(doctorID=doctor_id).first()
    reviews = tblReview.objects.filter(doctorID=doctor).order_by('-createdDT')
    
    avg_rating_dict = reviews.aggregate(Avg('rating'))
    avg_rating = avg_rating_dict['rating__avg'] or 0.0
    star5 = reviews.filter(rating=5).count()
    star4 = reviews.filter(rating=4).count()
    star3 = reviews.filter(rating=3).count()
    star2 = reviews.filter(rating=2).count()
    star1 = reviews.filter(rating=1).count()

    if reviews.count() > 0:
        p5 = (star5 / reviews.count()) * 100
        p4 = (star4 / reviews.count()) * 100
        p3 = (star3 / reviews.count()) * 100
        p2 = (star2 / reviews.count()) * 100
        p1 = (star1 / reviews.count()) * 100
    else:
        p5 = p4 = p3 = p2 = p1 = 0

    data = {
        "doctor": doctor,
        "reviews": reviews,
        "review_count": reviews.count(),
        "avg_rating": round(avg_rating, 1),
        'p5': p5,
        'p4': p4,
        'p3': p3,
        'p2': p2,
        'p1': p1,
    }
    return render(request, 'doctor_reviews.html', data)

def doctorMessages(request):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    doctor_id = request.session['doctorID']
    user_id = request.session['user_id']
    
    search_query = request.GET.get('search', '').strip()
    
    # Get all unique partners (patients) the doctor has chatted with
    # Logic: Get unique IDs of users who sent messages to this doctor or received messages from them
    chats = tblchat.objects.filter(
        models.Q(senderID=user_id) | models.Q(receiverID=user_id)
    ).order_by('-createdDT')
    
    partner_ids = []
    for chat in chats:
        other_id = chat.senderID if chat.senderID != user_id else chat.receiverID
        if other_id not in partner_ids:
            partner_ids.append(other_id)
    
    # Fetch user objects for these partners
    partners_list = []
    for pid in partner_ids:
        # Build query for the partner
        user_query = models.Q(userID=pid)
        if search_query:
            user_query &= (
                models.Q(userName__icontains=search_query) |
                models.Q(email__icontains=search_query)
            )
            
        p_user = tblUser.objects.filter(user_query).first()
        
        # If user doesn't match name/email, check if message content matches
        if not p_user and search_query:
            has_matching_message = chats.filter(
                (models.Q(senderID=pid, receiverID=user_id) | models.Q(senderID=user_id, receiverID=pid)) &
                models.Q(message__icontains=search_query)
            ).exists()
            
            if has_matching_message:
                p_user = tblUser.objects.filter(userID=pid).first()
                
        if p_user:
            # Get last message for this partner
            last_msg = chats.filter(
                models.Q(senderID=pid, receiverID=user_id) | 
                models.Q(senderID=user_id, receiverID=pid)
            ).first()
            
            partners_list.append({
                'user': p_user,
                'last_message': last_msg,
                'unread_count': chats.filter(senderID=pid, receiverID=user_id, isRead=False).count()
            })
    
    active_partner_id = request.GET.get('partner', '')
    
    data = {
        "doctor": tblDoctor.objects.filter(doctorID=doctor_id).first(),
        "partners": partners_list,
        "search_query": search_query,
        "active_partner_id": active_partner_id,
    }        
    return render(request, 'doctor_messages.html', data)
    
def doctorManageBlogs(request):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    doctor_id = request.session['doctorID']
    doctor = tblDoctor.objects.filter(doctorID=doctor_id).first()
    
    if request.method == 'POST':
        # Handle Delete
        delete_id = request.POST.get('delete_blog_id')
        if delete_id:
            blog = tblDoctorPost.objects.filter(doctorPostID=delete_id, doctorID=doctor).first()
            if blog:
                blog.delete()
            return redirect('doctorManageBlogs')
            
        # Handle Edit
        blog_id = request.POST.get('blog_id')
        if blog_id:
            blog = tblDoctorPost.objects.filter(doctorPostID=blog_id, doctorID=doctor).first()
            if blog:
                blog.title = request.POST.get('title')
                blog.description = request.POST.get('content')
                new_image = request.FILES.get('image')
                if new_image:
                    blog.thumbnail = new_image
                blog.save()
            return redirect('doctorManageBlogs')
            
    search_query = request.GET.get('search', '').strip()
    blogs = tblDoctorPost.objects.filter(doctorID=doctor).order_by('-createDT')
    if search_query:
        blogs = blogs.filter(title__icontains=search_query)
    
    data = {
        "doctor": doctor,
        "blogs": blogs,
        "search_query": search_query,
    }
    return render(request, 'doctor_manage_blogs.html', data)

def patientMyAppointments(request):
    if 'clientID' not in request.session:
        return redirect('Login')
    
    client_id = request.session['clientID']
    appointments = tblAppointment.objects.filter(clientID=client_id).select_related('payment')
    
    # Count calculations for summary cards (before filtering)
    total_count = appointments.count()
    upcoming_count = appointments.filter(isAccepted=False, isRejected=False).count()
    completed_count = appointments.filter(isAccepted=True).count()
    cancelled_count = appointments.filter(isRejected=True).count()
    
    # --- FILTERS ---
    search = request.GET.get('search', '').strip()
    filter_date = request.GET.get('date', '').strip()
    filter_doctor = request.GET.get('doctor', '').strip()
    filter_status = request.GET.get('status', '').strip()
    
    # Search filter — doctor name or appointment ID
    if search:
        appointments = appointments.filter(
            models.Q(doctorID__displayName__icontains=search) |
            models.Q(appointmentID__icontains=search)
        )
    
    # Date filter
    if filter_date:
        appointments = appointments.filter(appointmentDate=filter_date)
    
    # Doctor filter
    if filter_doctor:
        appointments = appointments.filter(doctorID=filter_doctor)
    
    # Status filter
    if filter_status == 'Upcoming':
        appointments = appointments.filter(isAccepted=False, isRejected=False)
    elif filter_status == 'Completed':
        appointments = appointments.filter(isAccepted=True)
    elif filter_status == 'Cancelled':
        appointments = appointments.filter(isRejected=True)
    
    appointments = appointments.order_by('-appointmentDate', '-appointmentTime')
    
    # Build doctor list for the dropdown (unique doctors this patient has appointments with)
    all_patient_appointments = tblAppointment.objects.filter(clientID=client_id)
    doctor_ids = all_patient_appointments.values_list('doctorID', flat=True).distinct()
    doctor_list = tblDoctor.objects.filter(doctorID__in=doctor_ids)
    
    data = {
        "appointments": appointments,
        "total_count": total_count,
        "upcoming_count": upcoming_count,
        "completed_count": completed_count,
        "cancelled_count": cancelled_count,
        "doctor_list": doctor_list,
    }
    
    return render(request, 'patient_my_appointments.html', data)

def patientMedicalHistory(request):
    if 'user_id' not in request.session:
        return redirect('Login')
    
    user_id = request.session['user_id']
    client_id = request.session.get('clientID')
    user = tblUser.objects.filter(userID=user_id).first()
    client = tblClient.objects.filter(clientID=client_id).first()
    
    appointments = tblAppointment.objects.filter(clientID=client_id).order_by('-appointmentDate', '-appointmentTime')
    
    # Case studies / history for this patient
    case_histories = tblclientHistory.objects.filter(clientID=client_id).order_by('-createdDT')
    
    has_history = case_histories.exists() or appointments.exists()
    
    # Calculate age
    age = 0
    if client and client.dob:
        today = date.today()
        dob = client.dob
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    
    total_visits = appointments.filter(isAccepted=True).count()
    
    data = {
        "user": user,
        "client": client,
        "appointments": appointments,
        "case_histories": case_histories,
        "has_history": has_history,
        "age": age,
        "total_visits": total_visits,
    }
    return render(request, 'patient_medical_history.html', data)



def patientProfileUpdate(request):
    if 'user_id' not in request.session:
        return redirect('Login')
    user_id=request.session['user_id']
    c=tblClient.objects.filter(userID=user_id).first()
    cities=tblCity.objects.all()
    states=tblState.objects.all()
    city_id = request.GET.get('city')
    if request.POST.get('btnUpdatePassword'):
        current_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        user = tblUser.objects.filter(userID=user_id).first()
        if new_password != confirm_password:
            messages.error(request, 'New password and confirm password do not match.')
        elif len(new_password) < 8:
            messages.error(request, 'New password must be at least 8 characters long.')
        elif user.password != current_password:
            messages.error(request, 'Current password is incorrect.')
        else:
            user.password = new_password
            user.save()
            request.session['password'] = new_password  # keep session in sync if stored
            messages.success(request, 'Password updated successfully!')
            return redirect('patientProfileUpdate')
        

    
    data={
        "user":tblUser.objects.filter(userID=user_id).first(),
        "client":c,
        "cities":cities,
        "states":states
    }
    return render(request, 'patient_update_profile.html',data)

def patientMessages(request):
    if 'user_id' not in request.session:
        return redirect('Login')
    user_id = request.session['user_id']
    
    notifications = tblnotification.objects.filter(userID=user_id).order_by('-createdDT')
    unread_count = notifications.filter(isRead=False).count()
    
    # Get all unique partners (doctors) the patient has chatted with
    chats = tblchat.objects.filter(
        models.Q(senderID=user_id) | models.Q(receiverID=user_id)
    ).order_by('-createdDT')
    
    partner_ids = []
    for chat in chats:
        other_id = chat.senderID if chat.senderID != user_id else chat.receiverID
        if other_id not in partner_ids:
            partner_ids.append(other_id)
    
    # Fetch user objects for these partners
    partners_list = []
    for pid in partner_ids:
        p_user = tblUser.objects.filter(userID=pid).first()
        if p_user:
            # Get last message for this partner
            last_msg = chats.filter(
                models.Q(senderID=pid, receiverID=user_id) | 
                models.Q(senderID=user_id, receiverID=pid)
            ).first()
            
            partners_list.append({
                'user': p_user,
                'last_message': last_msg,
                'unread_count': chats.filter(senderID=pid, receiverID=user_id, isRead=False).count()
            })
    
    active_partner_id = request.GET.get('partner', '')
    
    data = {
        "user": tblUser.objects.filter(userID=user_id).first(),
        "notifications": notifications,
        "unread_count": unread_count,
        "partners": partners_list,
        "active_partner_id": active_partner_id,
    }
    return render(request, 'patient_messages_notifications.html', data)
    
def send_message(request):
    if request.method == 'POST':
        if 'user_id' not in request.session:
            return JsonResponse({'status': 'error', 'message': 'Not logged in'}, status=401)
            
        sender_id = request.session['user_id']
        receiver_id = request.POST.get('receiver_id')
        message_text = request.POST.get('message')
        
        if not receiver_id or not message_text:
            return JsonResponse({'status': 'error', 'message': 'Missing data'}, status=400)
            
        # Save chat message
        tblchat.objects.create(
            senderID=sender_id,
            receiverID=receiver_id,
            message=message_text,
            isRead=False
        )
        
        # Create notification for receiver
        sender_user = tblUser.objects.filter(userID=sender_id).first()
        receiver_user = tblUser.objects.filter(userID=receiver_id).first()
        
        if receiver_user and sender_user:
            notif_message = f"New message from {sender_user.userName}: '{message_text[:30]}...'"
            tblnotification.objects.create(
                userID=receiver_user,
                senderID=sender_id,
                message=notif_message,
                isRead=False
            )
            
        return JsonResponse({'status': 'success'})
        
    return HttpResponseBadRequest("Invalid request method")

def patientPostDetails(request,id):
    data={
        "blogs":tblDoctorPost.objects.filter(doctorPostID=id),
        'comments':tblComments.objects.filter(doctorPostID=id, parent=None).order_by('-createdDT')
    }
    if request.POST.get('btnComment'):
        comment=request.POST.get('comment')
        parent_id=request.POST.get('parent_id')
        user_id=request.session['user_id']
        post=tblDoctorPost.objects.filter(doctorPostID=id).first()
        user=tblUser.objects.filter(userID=user_id).first()
        if user_id:
            parent_obj=None
            if parent_id:
                parent_obj=tblComments.objects.filter(commentsID=parent_id).first()
            new_comment=tblComments(
                comment=comment,
                userID=user,
                doctorPostID=post,
                parent=parent_obj
            )
            new_comment.save()
            return redirect('patientPostDetails', id=id)
    return render(request, 'patient_post_details.html',data)

def get_unread_notifications(request):
    if 'user_id' not in request.session:
        return JsonResponse({'status': 'error', 'message': 'Not logged in'}, status=401)
    
    user_id = request.session['user_id']
    user = tblUser.objects.filter(userID=user_id).first()
    
    if not user:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
        
    notifications = tblnotification.objects.filter(userID=user, isRead=False).order_by('-createdDT')
    
    notif_list = []
    for notif in notifications:
        # Simple heuristic to determine type; more robust would be a 'type' field in the model.
        notif_type = 'message' if 'message' in notif.message.lower() else 'appointment'
        notif_list.append({
            'id': notif.notificationID,
            'message': notif.message,
            'time': timezone.localtime(notif.createdDT).strftime("%b %d, %Y %I:%M %p"),
            'sender_id': notif.senderID,
            'type': notif_type
        })
        
    return JsonResponse({
        'status': 'success',
        'count': notifications.count(),
        'notifications': notif_list
    })

def get_chat_history(request):
    if 'user_id' not in request.session:
        return JsonResponse({'status': 'error', 'message': 'Not logged in'}, status=401)
    
    user_id = request.session['user_id']
    partner_id = request.GET.get('partner_id')
    
    if not partner_id:
        return JsonResponse({'status': 'error', 'message': 'Missing partner ID'}, status=400)
    
    partner = tblUser.objects.filter(userID=partner_id).first()
    if not partner:
        return JsonResponse({'status': 'error', 'message': 'Partner not found'}, status=404)
    
    # Fetch all chats between user and partner
    chats = tblchat.objects.filter(
        (models.Q(senderID=user_id) & models.Q(receiverID=partner_id)) |
        (models.Q(senderID=partner_id) & models.Q(receiverID=user_id))
    ).order_by('createdDT')
    
    # Mark messages as read if receiver is current user
    chats.filter(receiverID=user_id, isRead=False).update(isRead=True)
    
    messages = []
    for chat in chats:
        messages.append({
            'sender_id': str(chat.senderID),
            'message': chat.message,
            'time': timezone.localtime(chat.createdDT).strftime("%b %d, %Y %I:%M %p"),
            'is_sent': str(chat.senderID) == str(user_id)
        })
    
    # Check if partner is a doctor to provide profile link
    doctor = tblDoctor.objects.filter(userID=partner).first()
    doctor_id = doctor.doctorID if doctor else None

    return JsonResponse({
        'status': 'success',
        'partner': {
            'id': partner_id,
            'doctor_id': doctor_id,
            'name': partner.userName,
            'profile_pic': partner.profilePic.url if partner.profilePic else 'https://ui-avatars.com/api/?name=' + partner.userName,
            'is_online': bool(partner.last_seen and timezone.now() - partner.last_seen < timedelta(minutes=1))
        },
        'messages': messages,
        'current_user_id': user_id
    })

def mark_notifications_read(request):
    if request.method == 'POST':
        if 'user_id' not in request.session:
            return JsonResponse({'status': 'error', 'message': 'Not logged in'}, status=401)
            
        user_id = request.session['user_id']
        user = tblUser.objects.filter(userID=user_id).first()
        
        notif_id = request.POST.get('notification_id')
        
        if notif_id:
            # Mark specific notification
            tblnotification.objects.filter(notificationID=notif_id, userID=user).update(isRead=True)
        else:
            # Mark all as read
            tblnotification.objects.filter(userID=user, isRead=False).update(isRead=True)
            
        return JsonResponse({'status': 'success'})
        
    return HttpResponseBadRequest("Invalid request method")

from django.contrib import messages
from django.db.models import Max

def doctorTotalPatients(request):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    doctor_id = request.session['doctorID']
    doctor = tblDoctor.objects.filter(doctorID=doctor_id).first()

    all_appointments = tblAppointment.objects.filter(doctorID=doctor_id)
    client_ids = all_appointments.values_list('clientID', flat=True).distinct()
    
    clients = tblClient.objects.filter(clientID__in=client_ids)
    
    patient_data = []
    for c in clients:
        appts = all_appointments.filter(clientID=c)
        total_appointments = appts.count()
        latest_appt = appts.aggregate(latest=Max('appointmentDate'))['latest']
        
        case_studies_count = tblDoctorCaseStudy.objects.filter(doctorID=doctor, clientID=c).count()
        
        patient_data.append({
            'client': c,
            'total_appointments': total_appointments,
            'latest_appointment': latest_appt,
            'case_studies_count': case_studies_count
        })
        
    data = {
        'doctor': doctor,
        'patient_data': patient_data
    }
    return render(request, 'doctor_total_patients.html', data)

def doctorCaseStudy(request, id):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    doctor_id = request.session['doctorID']
    appointment = tblAppointment.objects.filter(clientID=id, doctorID=doctor_id).first()
    
    if not appointment:
        return redirect('doctorAppointments')
        
    # Calculate patient age
    age = 0
    if appointment.clientID.dob:
        today = date.today()
        dob = appointment.clientID.dob
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
    if request.method == 'POST':
        title = request.POST.get('title')
        symptoms = request.POST.get('symptoms')
        diagnosis = request.POST.get('diagnosis')
        prescription = request.POST.get('prescription')
        additional_notes = request.POST.get('additionalNotes')
        is_special = request.POST.get('is_marked_special') == 'on'
        doctor = tblDoctor.objects.filter(doctorID=doctor_id).first()
        
        tblclientHistory.objects.create(
            clientID=appointment.clientID,
            doctorID=doctor,
            title=title,
            symptoms=symptoms,
            diagnosis=diagnosis,
            prescription=prescription,
            additionalNotes=additional_notes,
            isMarkedSpecial=is_special
        )
        return redirect('doctorCaseStudy', id=id)

    case_histories = tblclientHistory.objects.filter(
        clientID=appointment.clientID
    ).order_by('-createdDT')

    data = {
        "doctor": tblDoctor.objects.filter(doctorID=doctor_id).first(),
        "appointment": appointment,
        "age": age,
        "case_histories": case_histories
    }
    return render(request, 'doctor_case_study.html', data)

def patientBlogs(request):
    user_id = request.session.get('user_id')

    is_following_anyone = False
    user = None
    c = None
    is_patient = False

    if user_id:
        user = tblUser.objects.filter(userID=user_id).first()
        if user:
            c = tblClient.objects.filter(userID=user.userID).first()
            if c:
                is_patient = True

    if is_patient:
        # User jo doctors ko follow karta hai unki list
        followed = tblFollow.objects.filter(userID=user).values_list('doctorID', flat=True)
        if followed.exists():
            is_following_anyone = True
            blogs = tblDoctorPost.objects.filter(doctorID__in=followed).order_by('-createDT')
        else:
            is_following_anyone = False
            blogs = tblDoctorPost.objects.none()
    else:
        # Doctors or non-logged-in users see all blogs
        blogs = tblDoctorPost.objects.all().order_by('-createDT')

    search_query = request.GET.get('search', '').strip()
    if search_query:
        blogs = blogs.filter(
            models.Q(title__icontains=search_query) |
            models.Q(description__icontains=search_query) |
            models.Q(doctorID__subcategoryID__subcategoryName__icontains=search_query)
        )

    # Dynamic Trending Blogs based on comments and doctor's reviews
    trending_blogs = tblDoctorPost.objects.annotate(
        comment_count=models.Count('tblcomments', distinct=True),
        review_count=models.Count('doctorID__tblreview', distinct=True)
    ).order_by('-comment_count', '-review_count')[:3]

    c = None
    is_patient = False
    if user:
        c = tblClient.objects.filter(userID=user.userID).first()
        if c:
            is_patient = True
    if is_patient:
        base_template = 'patient_base.html'
    else:
        base_template = 'base.html'

    data = {
        'blogs': blogs,
        'trending_blogs': trending_blogs,
        'is_following_anyone': is_following_anyone,
        'recent_posts':tblDoctorPost.objects.all().order_by('-createDT')[:5],
        'user':user,
        'client':c,
        'base_template': base_template,
        'is_patient': is_patient,
        'search_query': search_query,
    }
    return render(request, 'patient_blogs.html', data)

def doctorSchedule(request):
    if 'doctorID' not in request.session:
        return redirect('Login')
    
    doctor_id = request.session['doctorID']
    doctor = tblDoctor.objects.filter(doctorID=doctor_id).first()
    
    DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    if request.method == 'POST':
        for day_index in range(7):
            is_available = request.POST.get(f'available_{day_index}') == 'on'
            start_time = request.POST.get(f'start_time_{day_index}')
            end_time = request.POST.get(f'end_time_{day_index}')
            
            start_t = dt.strptime(start_time, '%H:%M').time() if start_time else None
            end_t = dt.strptime(end_time, '%H:%M').time() if end_time else None
            
            tblDoctorSchedule.objects.update_or_create(
                doctorID=doctor,
                day_of_week=day_index,
                defaults={
                    'start_time': start_t if is_available else None,
                    'end_time': end_t if is_available else None,
                    'is_available': is_available,
                }
            )
        return redirect('doctorSchedule')
    
    # GET: load existing schedule
    existing_schedule = tblDoctorSchedule.objects.filter(doctorID=doctor).order_by('day_of_week')
    schedule_dict = {s.day_of_week: s for s in existing_schedule}
    
    schedule_data = []
    for i in range(7):
        s = schedule_dict.get(i)
        schedule_data.append({
            'day_index': i,
            'day_name': DAY_NAMES[i],
            'is_available': s.is_available if s else False,
            'start_time': s.start_time.strftime('%H:%M') if s and s.start_time else '09:00',
            'end_time': s.end_time.strftime('%H:%M') if s and s.end_time else '17:00',
        })
    
    data = {
        'doctor': doctor,
        'schedule_data': schedule_data,
    }
    return render(request, 'doctor_schedule.html', data)

def get_available_slots(request):
    doctor_id = request.GET.get('doctor_id')
    selected_date = request.GET.get('date')
    
    if not doctor_id or not selected_date:
        return JsonResponse({'available': False, 'message': 'Missing parameters'})
    
    try:
        sel_date = dt.strptime(selected_date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'available': False, 'message': 'Invalid date format'})
    
    day_of_week = sel_date.weekday()  # 0=Monday
    
    schedule = tblDoctorSchedule.objects.filter(
        doctorID=doctor_id,
        day_of_week=day_of_week,
        is_available=True
    ).first()
    
    if not schedule or not schedule.start_time or not schedule.end_time:
        return JsonResponse({'available': False, 'message': 'Doctor is not available on this day.'})
    
    # Generate 30-min slots between start_time and end_time
    slots = []
    current = dt.combine(sel_date, schedule.start_time)
    end = dt.combine(sel_date, schedule.end_time)
    
    while current < end:
        slot_time = current.time()
        slot_value = slot_time.strftime('%H:%M')
        slot_label = slot_time.strftime('%I:%M %p')
        slots.append({'value': slot_value, 'label': slot_label})
        current += timedelta(minutes=30)
    
    # Filter out already booked slots
    booked_times = tblAppointment.objects.filter(
        doctorID=doctor_id,
        appointmentDate=sel_date,
        isRejected=False
    ).values_list('appointmentTime', flat=True)
    
    booked_set = set(t.strftime('%H:%M') for t in booked_times)
    slots = [s for s in slots if s['value'] not in booked_set]
    
    # If today, filter out past times
    today = date.today()
    if sel_date == today:
        now_time = dt.now().time()
        slots = [s for s in slots if dt.strptime(s['value'], '%H:%M').time() > now_time]
    
    if not slots:
        return JsonResponse({'available': True, 'slots': [], 'message': 'All slots are booked for this day.'})
    
    return JsonResponse({'available': True, 'slots': slots})

def get_doctors_api(request):
    doctors = tblDoctor.objects.filter(approval_status='approved')
    doctor_list = []
    for doctor in doctors:
        doctor_list.append({
            'id': doctor.doctorID,
            'name': doctor.displayName,
            'specialization': doctor.subcategoryID.subcategoryName,
            'profile_image': doctor.userID.profilePic.url if doctor.userID.profilePic else None,
        })
    return JsonResponse(doctor_list, safe=False)

def get_blogs_api(request):
    blogs = tblDoctorPost.objects.all().order_by('-createDT')[:10]
    blog_list = []
    for blog in blogs:
        blog_list.append({
            'id': blog.doctorPostID,
            'title': blog.title,
            'description': blog.description[:120] + '...' if len(blog.description) > 120 else blog.description,
            'thumbnail': blog.thumbnail.url if blog.thumbnail else None,
            'doctor_name': blog.doctorID.displayName,
            'specialization': blog.doctorID.subcategoryID.subcategoryName,
        })
    return JsonResponse(blog_list, safe=False)