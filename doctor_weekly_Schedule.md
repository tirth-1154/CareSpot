# Weekly Schedule Based Appointment Booking

Doctors set a weekly schedule (per day of week), and patients see available time slots based on the selected doctor's schedule for the selected date.

## Proposed Changes

### Part 1: Doctor Schedule Management

#### [NEW] [doctor_schedule.html](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/templates/doctor_schedule.html)
- A full-page form with a row for each day (Mon–Sun).
- Each row has: Day name, Start Time input, End Time input, Available toggle.
- Submit button saves all 7 days at once.

#### [MODIFY] [views.py](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/views.py)
- Add `doctorSchedule(request)` view:
  - **GET**: Load existing [tblDoctorSchedule](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/models.py#169-192) entries for the logged-in doctor, pre-fill form.
  - **POST**: Save/update all 7 days using `update_or_create()`.

#### [MODIFY] [urls.py](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/urls.py)
- Add `path('doctorSchedule/', views.doctorSchedule, name='doctorSchedule')`.

#### [MODIFY] [base.html](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/templates/base.html)
- Add "My Schedule" link to the doctor sidebar navigation.

---

### Part 2: AJAX Endpoint for Available Slots

#### [MODIFY] [views.py](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/views.py)
- Add `get_available_slots(request)` AJAX view:
  - Accepts `doctor_id` and [date](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/templates/doctor_profile.html#614-624) as GET params.
  - Looks up the [tblDoctorSchedule](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/models.py#169-192) for that doctor and the day of week.
  - Generates 30-min time slots between `start_time` and `end_time`.
  - Filters out already booked slots from [tblAppointment](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/models.py#97-108).
  - If today, also filters out past time slots.
  - Returns JSON: `{ "available": true, "slots": [{"value": "09:00", "label": "09:00 AM"}, ...] }` or `{ "available": false }`.

#### [MODIFY] [urls.py](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/urls.py)
- Add `path('ajax/get_available_slots/', views.get_available_slots, name='get_available_slots')`.

---

### Part 3: Patient Booking Page Updates

#### [MODIFY] [patient_book_appointment.html](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/templates/patient_book_appointment.html)
- Remove the hardcoded `allTimeSlots` JS array.
- Add a [fetch()](file:///e:/python/Python%20major%20project/Carepot%20python%20project/carespot/user/templates/base.html#491-503) call to `/ajax/get_available_slots/` when doctor AND date are both selected.
- Populate the time slot dropdown with the returned available slots.
- Show "Doctor is not available on this day" if `available: false`.

## Verification Plan

### Manual Verification
1. **Doctor side**: Log in as doctor → Go to "My Schedule" → Set availability for Mon-Fri (e.g., 9 AM–5 PM) → Save.
2. **Patient side**: Log in as patient → Book Appointment → Select that doctor → Select a Monday → Verify time slots show 9 AM–5 PM in 30-min intervals.
3. Select a Saturday (if unavailable) → Verify "Not available" message shows.
4. Book a slot → Re-select same date → Verify the booked slot is no longer available.
