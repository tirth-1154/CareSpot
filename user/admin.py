from django.contrib import admin
from django.utils.safestring import mark_safe
from django.urls import reverse
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import *

@admin.register(tblUser)
class UserAdmin(ModelAdmin):
    change_list_template = "admin/user/tbluser/change_list.html"
    list_display = ('userID', 'userName', 'email', 'mobileNumber', 'cityID', 'is_doctor_status', 'edit_action')
    list_display_links = ('userID', 'userName')
    list_filter = ('IsDoctor', 'cityID')
    search_fields = ('userName', 'email', 'mobileNumber')
    list_filter_submit = True
    
    @display(description="Role", label={True: "success", False: "info"})
    def is_doctor_status(self, obj):
        return obj.IsDoctor
        
    @display(description="Action")
    def edit_action(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.pk])
        return mark_safe(f'<a href="{url}" class="font-bold underline text-primary-600">Edit Details</a>')

@admin.register(tblDoctor)
class DoctorAdmin(ModelAdmin):
    list_display = ('doctorID', 'displayName', 'displayContact', 'subcategoryID', 'mode_status', 'edit_action')
    list_display_links = ('doctorID', 'displayName')
    list_filter = ('subcategoryID', 'mode')
    search_fields = ('displayName', 'displayContact', 'bio')
    list_filter_submit = True

    # Sectioning the form for better Healthcare UX
    fieldsets = (
        ("Basic Information", {
            "fields": (("userID", "displayName"), "bio", "displayContact")
        }),
        ("Professional Details", {
            "fields": ("subcategoryID", "yearOfExperience", "licenseNo", "consultationFees")
        }),
        ("Clinic & Docs", {
            "fields": ("displayAddress", "documents", "mode", "approval_status")
        }),
    )
    
    @display(description="Current Status", label={1: "success", 0: "danger"})
    def mode_status(self, obj):
        if obj.mode == 1:
            return True, "Online"
        return False, "Offline"

    @display(description="Action")
    def edit_action(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.pk])
        return mark_safe(f'<a href="{url}" class="font-bold underline text-primary-600">Manage</a>')

@admin.register(tblClient)
class ClientAdmin(ModelAdmin):
    change_form_template = "admin/user/tblclient/change_form.html"
    list_display = ('clientID', 'name', 'gender', 'bloodGroup', 'dob', 'edit_action')
    list_display_links = ('clientID', 'name')
    list_filter = ('gender', 'bloodGroup')
    search_fields = ('name', 'description')
    list_filter_submit = True

    @display(description="Action")
    def edit_action(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.pk])
        return mark_safe(f'<a href="{url}" class="font-bold underline text-primary-600">View Patient</a>')

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        try:
            obj = self.get_object(request, object_id)
            if obj:
                extra_context['medical_history'] = tblclientHistory.objects.filter(clientID=obj).order_by('-createdDT')[:3]
                extra_context['recent_appointments'] = tblAppointment.objects.filter(clientID=obj).order_by('-appointmentDate')[:4]
                extra_context['recent_reports'] = tblPatientReport.objects.filter(clientID=obj).order_by('-uploadedDT')[:4]
        except Exception as e:
            pass
        return super().change_view(request, object_id, form_url, extra_context=extra_context)

@admin.register(tblAppointment)
class AppointmentAdmin(ModelAdmin):
    list_display = ('appointmentID', 'clientID', 'doctorID', 'appointmentDate', 'appointmentTime', 'status_label', 'edit_action')
    list_display_links = ('appointmentID',)
    list_filter = ('isAccepted', 'isRejected', 'appointmentDate')
    search_fields = ('clientID__name', 'doctorID__displayName')
    list_filter_submit = True

    # Organizing Appointment Details
    fieldsets = (
        ("Scheduling", {
            "fields": ("clientID", "doctorID", ("appointmentDate", "appointmentTime"))
        }),
        ("Meeting Details", {
            "fields": ("mode", "meetLink")
        }),
        ("Process Status", {
            "fields": (("isAccepted", "isRejected"),)
        }),
    )

    @display(description="Status", label=True)
    def status_label(self, obj):
        if obj.isAccepted:
            return "success", "Accepted"
        elif obj.isRejected:
            return "danger", "Rejected"
        return "warning", "Pending"

    @display(description="Action")
    def edit_action(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.pk])
        return mark_safe(f'<a href="{url}" class="font-bold underline text-primary-600">Review</a>')

@admin.register(tblReview)
class ReviewAdmin(ModelAdmin):
    list_display = ('reviewID', 'doctorID', 'userID', 'rating_stars', 'createdDT')
    list_filter = ('rating',)
    search_fields = ('review',)
    
    @display(description="Rating")
    def rating_stars(self, obj):
        return "⭐" * obj.rating

@admin.register(tblSupportTicket)
class SupportTicketAdmin(ModelAdmin):
    list_display = ('ticketID', 'name', 'email', 'subject', 'status_badge', 'createdDT')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'subject')
    list_filter_submit = True

    @display(description="Ticket Status", label={"Open": "warning", "Closed": "success", "Pending": "info"})
    def status_badge(self, obj):
        return obj.status

@admin.register(tblPayment)
class PaymentAdmin(ModelAdmin):
    list_display = ('paymentID', 'appointmentID', 'totalAmount', 'paymentStatus', 'paymentMethod', 'createdDT')
    list_filter = ('paymentStatus', 'paymentMethod')
    search_fields = ('razorpay_order_id', 'appointmentID__clientID__name')
    list_filter_submit = True

# Register remaining models
admin.site.register(tblCity, ModelAdmin)
admin.site.register(tblState, ModelAdmin)
admin.site.register(tblSubcategory, ModelAdmin)
admin.site.register(tblCategory, ModelAdmin)
admin.site.register(tblDoctorPost, ModelAdmin)
admin.site.register(tblDoctorImages, ModelAdmin)
admin.site.register(tblComments, ModelAdmin)
admin.site.register(tblclientHistory, ModelAdmin)
admin.site.register(tblchat, ModelAdmin)
admin.site.register(tblnotification, ModelAdmin)
admin.site.register(tblFollow, ModelAdmin)
admin.site.register(tblDoctorAttachment, ModelAdmin)
admin.site.register(tblDiagnosis, ModelAdmin)
admin.site.register(tblPatientReport, ModelAdmin)
admin.site.register(tblDoctorSchedule, ModelAdmin)
admin.site.register(tblDoctorCaseStudy, ModelAdmin)
