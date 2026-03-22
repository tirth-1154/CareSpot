# Doctor Dashboard Dynamic Conversion

Convert the doctor dashboard from using static/placeholder data to fully dynamic data driven by the Django backend, while keeping the existing premium UI design in [doctor_dashboard.html](file:///e:/carespot/user/templates/doctor_dashboard.html).

## Summary of Changes

The [doctor_dashboard.html](file:///e:/carespot/user/templates/doctor_dashboard.html) template already has the right UI structure with Bootstrap 5 + FontAwesome. However:
1. The **[doctorDashboard](file:///e:/carespot/user/views.py#441-451) view** only passes the [doctor](file:///e:/carespot/user/views.py#263-310) object — all statistics show hardcoded defaults
2. The **template** uses incorrect variable names (`appointment.patient.name`, `appointment.time`, `appointment.reason`, `appointment.status`, etc.) that don't match the actual [tblAppointment](file:///e:/carespot/user/models.py#96-106) model fields
3. The **notifications section** shows 3 hardcoded notifications instead of dynamic ones from [tblnotification](file:///e:/carespot/user/models.py#137-145)
4. The **specialization badge** references `doctor.specialization` which doesn't exist (should be `doctor.subcategoryID.subcategoryName`)
5. The **quick action buttons** link to `#` instead of named URLs
6. The **recent patients section** uses `patient.age` and `patient.last_visit_date` which don't exist in [tblClient](file:///e:/carespot/user/models.py#84-95)

---

## Proposed Changes

### Backend: [user/views.py](file:///e:/carespot/user/views.py)

#### [MODIFY] [views.py](file:///e:/carespot/user/views.py)

Update the [doctorDashboard](file:///e:/carespot/user/views.py#441-451) view (lines 441–450) to compute and pass:

- [doctor](file:///e:/carespot/user/views.py#263-310) — the [tblDoctor](file:///e:/carespot/user/models.py#42-56) object (already there)
- `today_appointments` — queryset of [tblAppointment](file:///e:/carespot/user/models.py#96-106) filtered by today's date and this doctor
- `todays_appointments_count` — count of above
- `total_patients_count` — count of unique `clientID`s across all the doctor's appointments
- `upcoming_appointments_count` — count of appointments where `isAccepted=False` and `isRejected=False`
- `completed_appointments_count` — count of appointments where `isAccepted=True`
- `upcoming_appointments` — queryset for the upcoming appointments table (next 5)
- `recent_patients` — list of recent unique patient [tblClient](file:///e:/carespot/user/models.py#84-95) objects (last 5)
- [notifications](file:///e:/carespot/user/views.py#1012-1032) — last 5 notifications from [tblnotification](file:///e:/carespot/user/models.py#137-145) for the doctor's user account

---

### Frontend: [doctor_dashboard.html](file:///e:/carespot/user/templates/doctor_dashboard.html)

#### [MODIFY] [doctor_dashboard.html](file:///e:/carespot/user/templates/doctor_dashboard.html)

1. **Specialization badge**: Change `doctor.specialization` → `doctor.subcategoryID.subcategoryName`

2. **Today's Appointments table**: Fix field names:
   - `appointment.patient.name` → `appointment.clientID.name`
   - `appointment.time` → `appointment.appointmentTime`
   - `appointment.reason` → use `appointment.clientID.description` (reason/chief complaint)
   - `appointment.status` → use `{% if %}` logic: Pending / Accepted / Rejected
   - Actions: Use real URLs `{% url 'acceptAppointment' appointment.appointmentID %}` and `{% url 'rejectAppointment' appointment.appointmentID %}`

3. **Upcoming Appointments table**: Fix field names:
   - `appointment.patient.name` → `appointment.clientID.name`
   - `appointment.date` → `appointment.appointmentDate`
   - `appointment.time` → `appointment.appointmentTime`
   - `appointment.status` → use `{% if %}` logic

4. **Recent Patients section**: Fix field names:
   - `patient.name` → `patient.name` (already correct in tblClient)
   - Remove `patient.age` (not in model), replace with `patient.gender` and `patient.bloodGroup`
   - `patient.last_visit_date` → computed from last appointment (passed from view)

5. **Notifications section**: Replace the 3 hardcoded `<li>` items with:
   ```html
   {% for notification in notifications %}
   <li>
     <div class="notification-icon"><i class="fa-regular fa-bell"></i></div>
     <span class="notification-text">{{ notification.message }}</span>
     <small class="text-muted ms-auto">{{ notification.createdDT|timesince }} ago</small>
   </li>
   {% empty %}
   <li><div class="text-center text-muted w-100 py-3">No new notifications.</div></li>
   {% endfor %}
   ```

6. **Quick Action Buttons**: Replace `href="#"` with named URLs:
   - All Appointments → `{% url 'doctorAppointments' %}`
   - Patient Records → `{% url 'doctorAppointments' %}` (no dedicated view)
   - Update Profile → `{% url 'doctorUpdateProfile' %}`

---

## Verification Plan

### Manual Verification

1. Start the Django dev server: `python manage.py runserver` from `e:\carespot`
2. Log in as a doctor at `http://127.0.0.1:8000/`
3. Navigate to the Doctor Dashboard at `http://127.0.0.1:8000/doctorDashboard/`
4. Verify:
   - Welcome section shows the logged-in doctor's name and today's real date
   - The specialization badge shows the doctor's actual specialization (not "General Practitioner" default)
   - Stats cards show real numbers (not the fallback defaults like 8, 145, 24, 312)
   - Today's Appointments table shows real appointments for today, or "No appointments scheduled for today." if none
   - Upcoming Appointments table shows real pending appointments
   - Recent Patients section shows real patient names with correct details
   - Notifications section shows real notifications from the database
   - Quick Action Buttons navigate to the correct pages
