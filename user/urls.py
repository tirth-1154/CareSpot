from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    #common urls
    path('home/',views.home , name='home'),
    path('', views.intro, name='intro'),
    path('login/', views.Login, name='Login'),
    path('logout/',views.logout , name='logout'),
    path('followDoctor/<int:id>/',views.followDoctor , name='followDoctor'),
    
    path('forgotPassword/', views.forgotPassword, name='forgotPassword'),
    path('verifyOTP/', views.verifyOTP, name='verifyOTP'),
    path('resetPassword/', views.resetPassword, name='resetPassword'),

    #doctor urls
    path('doctorRegister/',views.doctorRegister , name='doctorRegister'),
    path('doctorPostDetails/<int:id>/',views.doctorPostDetails , name='doctorPostDetails'),
    path('doctorPostAdd/',views.doctorPostAdd , name='doctorPostAdd'),
    path('doctorProfile/',views.doctorProfile , name='doctorProfile'),
    path('doctorDashboard/',views.doctorDashboard,name='doctorDashboard'),
    path('doctorUpdateProfile/',views.doctorUpdateProfile , name='doctorUpdateProfile'),
    path('doctorSearch/',views.doctorSearch , name='doctorSearch'),
    path('rejectAppointment/<int:id>/', views.rejectAppointment, name='rejectAppointment'),
    path('acceptAppointment/<int:id>/', views.acceptAppointment, name='acceptAppointment'),
    path('doctorAppointments/',views.doctorAppointments,name='doctorAppointments'), 
    path('doctorReviews/',views.doctorReviews,name='doctorReviews'),
    path('doctorMessages/',views.doctorMessages,name='doctorMessages'),
    path('doctorManageBlogs/',views.doctorManageBlogs,name='doctorManageBlogs'),
    path('doctorTotalPatients/', views.doctorTotalPatients, name='doctorTotalPatients'),
    # path('addDoctorCaseStudy/<int:app_id>/', views.addDoctorCaseStudy, name='addDoctorCaseStudy'),
    path('doctorCaseStudy/<int:id>/', views.doctorCaseStudy, name='doctorCaseStudy'),
    path('doctorSchedule/', views.doctorSchedule, name='doctorSchedule'),
    # path('doctorCaseStudy/',views.doctorCaseStudy,name='doctorCaseStudy'),


    #patient urls
    path('patientBlogs/',views.patientBlogs , name='patientBlogs'),
    path('viewDoctorProfile/<int:id>/',views.viewDoctorProfile , name='viewDoctorProfile'),
    path('patientRegister/',views.patientRegister,name='patientRegister'),
    path('patientDashboard/',views.patientDashboard,name='patientDashboard'),
    path('patientDoctorsList/',views.patientDoctorsList,name='patientDoctorsList'),
    path('patientAppointments/',views.patientAppointments,name='patientAppointments'),
    path('patientMyAppointments/',views.patientMyAppointments,name='patientMyAppointments'),
    path('patientMedicalHistory/',views.patientMedicalHistory,name='patientMedicalHistory'),
    path('patientProfileUpdate/',views.patientProfileUpdate,name='patientProfileUpdate'),
    path('patientPostDetails/<int:id>/',views.patientPostDetails,name='patientPostDetails'),
    path('patientMessages/',views.patientMessages,name='patientMessages'),
    
    #ajax urls
    path('ajax/get_notifications/', views.get_unread_notifications, name='get_unread_notifications'),
    path('ajax/mark_notifications_read/', views.mark_notifications_read, name='mark_notifications_read'),
    path('ajax/send_message/', views.send_message, name='send_message'),
    path('ajax/get_chat_history/', views.get_chat_history, name='get_chat_history'),
    path('ajax/get_available_slots/', views.get_available_slots, name='get_available_slots'),
    path('ajax/get_doctor_fees/', views.get_doctor_fees, name='get_doctor_fees'),
    path('api/doctors/', views.get_doctors_api, name='get_doctors_api'),
    
    #payment urls
    path('payment/<int:appointment_id>/', views.paymentPage, name='paymentPage'),
    path('ajax/verify_payment/', views.verifyPayment, name='verifyPayment'),
    path('payment/success/<int:appointment_id>/', views.paymentSuccess, name='paymentSuccess'),
    
    #meeting url
    path('meeting/<int:appointment_id>/', views.videoMeeting, name='videoMeeting'),
]

