from functools import wraps
from django.shortcuts import redirect

def admin_login_required(view_func):
    """
    Decorator that checks if the user is authenticated as a site admin.
    Redirects to admin login page if not authenticated.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.session.get('is_site_admin'):
            return redirect('customadmin:admin_login')
        return view_func(request, *args, **kwargs)
    return wrapper
