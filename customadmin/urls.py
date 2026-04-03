from django.urls import path
from . import views

app_name = 'customadmin'

urlpatterns = [
    # Auth
    path('', views.admin_login, name='admin_login'),
    path('login/', views.admin_login, name='admin_login_alt'),
    path('logout/', views.admin_logout, name='admin_logout'),

    # Dashboard
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),

    # Management Pages
    path('users/', views.admin_users, name='admin_users'),
    path('doctors/', views.admin_doctors, name='admin_doctors'),
    path('patients/', views.admin_patients, name='admin_patients'),
    path('appointments/', views.admin_appointments, name='admin_appointments'),
    path('reviews/', views.admin_reviews, name='admin_reviews'),
    path('blogs/', views.admin_blogs, name='admin_blogs'),
    path('categories/', views.admin_categories, name='admin_categories'),
    path('locations/', views.admin_locations, name='admin_locations'),

    # AJAX Delete Endpoints
    path('delete/user/<int:id>/', views.admin_user_delete, name='admin_user_delete'),
    path('delete/doctor/<int:id>/', views.admin_doctor_delete, name='admin_doctor_delete'),
    path('approve/doctor/<int:id>/', views.admin_doctor_approve, name='admin_doctor_approve'),
    path('reject/doctor/<int:id>/', views.admin_doctor_reject, name='admin_doctor_reject'),
    path('delete/patient/<int:id>/', views.admin_patient_delete, name='admin_patient_delete'),
    path('delete/appointment/<int:id>/', views.admin_appointment_delete, name='admin_appointment_delete'),
    path('delete/blog/<int:id>/', views.admin_blog_delete, name='admin_blog_delete'),
    path('delete/review/<int:id>/', views.admin_review_delete, name='admin_review_delete'),
    path('delete/category/<int:id>/', views.admin_category_delete, name='admin_category_delete'),
    path('delete/subcategory/<int:id>/', views.admin_subcategory_delete, name='admin_subcategory_delete'),
    path('delete/state/<int:id>/', views.admin_state_delete, name='admin_state_delete'),
    path('delete/city/<int:id>/', views.admin_city_delete, name='admin_city_delete'),

    # Add Endpoints
    path('add/category/', views.admin_category_add, name='admin_category_add'),
    path('add/subcategory/', views.admin_subcategory_add, name='admin_subcategory_add'),
    path('add/state/', views.admin_state_add, name='admin_state_add'),
    path('add/city/', views.admin_city_add, name='admin_city_add'),

    # API
    path('api/chart-data/', views.admin_chart_data, name='admin_chart_data'),
    
    # Support Tickets
    path('support/', views.admin_support, name='admin_support'),
    path('support/update/<int:id>/', views.admin_support_update, name='admin_support_update'),
]
