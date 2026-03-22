from django.core.management.base import BaseCommand
from user.auto_reject import auto_reject_expired_appointments


class Command(BaseCommand):
    help = 'Auto-reject appointments that have been pending for more than 24 hours'

    def handle(self, *args, **options):
        count = auto_reject_expired_appointments()
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Successfully auto-rejected {count} expired appointment(s).'))
        else:
            self.stdout.write(self.style.SUCCESS('No expired appointments found.'))
