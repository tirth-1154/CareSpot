# Implementation Plan: React Registration Page

The goal is to integrate the provided `hero-button-expendable.tsx` expandable hero component and repurpose it as a highly interactive, beautifully designed registration page for DocSpot (handling both Patient and Doctor registration, or just Patient initially).

## Proposed Changes

### 1. Dependencies and Setup
- **Install NPM Packages:** Run `npm install lucide-react framer-motion @paper-design/shaders-react` in the `frontend` directory.
- **Tailwind Configuration:** Extend [frontend/src/index.css](file:///e:/CareSpot/frontend/src/index.css) with the provided Tailwind configuration colors and animations to support the new component's design system.

### 2. Backend API Endpoint
Since the form requires a city selection and a subcategory selection (for doctors), we must expose this data to the React frontend.
#### [MODIFY] user/views.py
- Add `get_cities_api(request)` to return a JSON list of all [tblCity](file:///e:/CareSpot/user/models.py#9-15) objects.
#### [MODIFY] user/urls.py
- Register `/api/cities/` to point to `get_cities_api`.

### 3. Frontend Component Modification
#### [NEW] frontend/src/components/ui/register-hero.tsx
Create the modified version of the given component:
- **Hero Section:** Update text to "Join DocSpot" instead of "Revenue engine". Change colors to match the DocSpot theme (e.g., `#0288D1`, `#4FC3F7`).
- **Modal Left Side:** Replace B2B testimonials with healthcare benefits ("Smart Scheduling", "Top Specialists", patient testimonial).
- **Modal Right Side (Form):** Convert the simple form into a comprehensive registration form that matches the Django backend requirements. 
  - Add fields for Patient: Name, Email, Password, DOB, Gender, Contact, City (fetched from API), Address, Medical Details (Blood Group, History), and Profile Image upload.
  - Implement form submission using [fetch](file:///e:/CareSpot/frontend/src/App.tsx#31-54) to send a `FormData` POST request directly to the existing Django registration URL (or a new unified API endpoint).

### 4. Integration with Django
#### [MODIFY] frontend/src/main.tsx
- Update the entry point to look for a `#register-root` container. If it exists, render the new `RegisterHero` component instead of the [App](file:///e:/CareSpot/frontend/src/App.tsx#21-135) component.
#### [MODIFY] user/templates/pateient_register.html (or a new template)
- Clear out the existing HTML form.
- Inject the React `#register-root` container.
- Pass the CSRF token via a `window.CSRF_TOKEN` script or a data attribute so the React app can authenticate its POST requests.

## Verification Plan
### Automated Tests
- Run `npm run build` to ensure the new dependencies and components compile successfully.
- Verify Django server runs without syntax errors.

### Manual Verification
1. Navigate to `/patientRegister/` (or the unified `/register/` page).
2. Verify that the new Hero UI is displayed with the GodRays background.
3. Click "Start your journey" to expand the modal.
4. Verify that the Left Side information represents DocSpot accurately.
5. Fill out the Right Side form completely, including selecting a dynamically fetched City and uploading a test image.
6. Submit the form and verify that the success state appears in the React component.
7. Check the Django Admin or SQLite database to confirm the new `tblPatient`/[tblUser](file:///e:/CareSpot/user/models.py#29-42) record was successfully created with all fields.
