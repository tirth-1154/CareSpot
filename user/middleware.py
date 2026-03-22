import time
from .auto_reject import auto_reject_expired_appointments, delete_expired_otps

# Module-level variable — last time the check ran
_last_check_time = 0
# 5 minutes throttle (300 seconds)
CHECK_INTERVAL = 300


class AutoRejectMiddleware:
    """
    Har request pe check karta hai ki koi expired appointment toh nahi hai.
    Performance ke liye 5 minute ka throttle lagaya hai — har 5 min me
    sirf ek baar check hota hai.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        global _last_check_time
        current_time = time.time()

        # Sirf 5 min ka gap hone pe check karo
        if current_time - _last_check_time >= CHECK_INTERVAL:
            _last_check_time = current_time
            try:
                auto_reject_expired_appointments()
                delete_expired_otps()
            except Exception:
                pass  # Silently handle any errors so it doesn't break the request

        response = self.get_response(request)
        return response

class UserActivityMiddleware:
    """
    Tracks the last time a user was seen by updating the last_seen field.
    Throttled to update at most once every 60 seconds per user to save DB writes.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.session.get('user_id'):
            from user.models import tblUser
            from django.utils import timezone
            from datetime import timedelta
            
            user_id = request.session.get('user_id')
            try:
                user = tblUser.objects.get(userID=user_id)
                now = timezone.now()
                # Update only if last_seen is null or older than 30 seconds
                if not user.last_seen or now - user.last_seen > timedelta(seconds=30):
                    user.last_seen = now
                    user.save(update_fields=['last_seen'])
            except Exception:
                pass

        response = self.get_response(request)
        return response
