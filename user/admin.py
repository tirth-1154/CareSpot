from django.contrib import admin
from .models import *

from django.utils.safestring import mark_safe

from django.urls import reverse

class UserAdmin(admin.ModelAdmin):
    list_display = ('userID', 'userName', 'email', 'mobileNumber', 'cityID', 'IsDoctor', 'edit_action')
    list_display_links = ('userID', 'userName')
    list_filter = ('IsDoctor', 'cityID')
    search_fields = ('userName', 'email', 'mobileNumber')

    def edit_action(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.pk])
        return mark_safe(f'<a class="button" style="background-color: #0d7a8b; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-decoration: none;" href="{url}">Edit</a>')
    edit_action.short_description = 'Action'

class DoctorAdmin(admin.ModelAdmin):
    list_display = ('doctorID', 'displayName', 'displayContact', 'subcategoryID', 'mode_status', 'edit_action')
    list_display_links = ('doctorID', 'displayName')
    list_filter = ('subcategoryID', 'mode')
    search_fields = ('displayName', 'displayContact', 'bio')

    def edit_action(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.pk])
        return mark_safe(f'<a class="button" style="background-color: #0d7a8b; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-decoration: none;" href="{url}">Edit</a>')
    edit_action.short_description = 'Action'

    def mode_status(self, obj):
        if obj.mode == 1:
            return mark_safe('<span class="badge badge-success">Online</span>')
        return mark_safe('<span class="badge badge-warning">Offline</span>')
    mode_status.short_description = 'Status'

class ClientAdmin(admin.ModelAdmin):
    list_display = ('clientID', 'name', 'gender', 'bloodGroup', 'dob', 'edit_action')
    list_display_links = ('clientID', 'name')
    list_filter = ('gender', 'bloodGroup')
    search_fields = ('name', 'description')

    def edit_action(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.pk])
        return mark_safe(f'<a class="button" style="background-color: #0d7a8b; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-decoration: none;" href="{url}">Edit</a>')
    edit_action.short_description = 'Action'

class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointmentID', 'clientID', 'doctorID', 'appointmentDate', 'appointmentTime', 'status_badge', 'edit_action')
    list_display_links = ('appointmentID',)
    list_filter = ('isAccepted', 'isRejected', 'appointmentDate')
    search_fields = ('clientID__name', 'doctorID__displayName')

    def edit_action(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.pk])
        return mark_safe(f'<a class="button" style="background-color: #0d7a8b; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-decoration: none;" href="{url}">Edit</a>')
    edit_action.short_description = 'Action'

    def status_badge(self, obj):
        if obj.isAccepted:
            return mark_safe('<span class="badge badge-success">Accepted</span>')
        elif obj.isRejected:
            return mark_safe('<span class="badge badge-danger">Rejected</span>')
        return mark_safe('<span class="badge badge-warning">Pending</span>')
    status_badge.short_description = 'Status'

class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewID', 'doctorID', 'userID', 'rating', 'createdDT')
    list_filter = ('rating',)
    search_fields = ('review',)

admin.site.register(tblUser, UserAdmin)

admin.site.register(tblCity)
admin.site.register(tblState)
admin.site.register(tblSubcategory)
admin.site.register(tblCategory)
admin.site.register(tblDoctorPost)

admin.site.register(tblDoctor, DoctorAdmin)
admin.site.register(tblDoctorImages)
admin.site.register(tblComments)

admin.site.register(tblClient, ClientAdmin)
admin.site.register(tblAppointment, AppointmentAdmin)
admin.site.register(tblclientHistory)   

admin.site.register(tblReview, ReviewAdmin)
admin.site.register(tblchat)
admin.site.register(tblnotification)
admin.site.register(tblFollow)
admin.site.register(tblDoctorAttachment)
# admin.site.register(tblDoctorSchedule)

# Register your models here.
