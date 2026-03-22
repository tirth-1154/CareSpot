from .models import tblchat, tblUser, tblnotification

def notifications_processor(request):
    if 'user_id' in request.session:
        user_id = request.session['user_id']
        
        # 1. Unread Messages (for Envelope Icon)
        unread_chats = tblchat.objects.filter(receiverID=user_id, isRead=False).order_by('-createdDT')
        unread_messages_count = unread_chats.count()
        
        # Get last 5 notifications for dropdown
        message_notifs = []
        for chat in unread_chats[:5]:
            sender = tblUser.objects.filter(userID=chat.senderID).first()
            message_notifs.append({
                'sender_name': sender.userName if sender else "Unknown",
                'sender_pic': sender.profilePic.url if sender and sender.profilePic else None,
                'message': chat.message,
                'time': chat.createdDT,
                'chat_id': chat.chatID
            })
            
        # 2. General Notifications (for Bell Icon)
        unread_general = tblnotification.objects.filter(userID=user_id, isRead=False).order_by('-createdDT')
        unread_general_count = unread_general.count()
        
        general_notifs = []
        for notif in unread_general[:5]:
            general_notifs.append({
                'id': notif.notificationID,
                'message': notif.message,
                'time': notif.createdDT
            })
            
        return {
            'nav_unread_messages': message_notifs,
            'nav_messages_count': unread_messages_count,
            'nav_unread_general': general_notifs,
            'nav_general_count': unread_general_count
        }
    return {
        'nav_unread_messages': [],
        'nav_messages_count': 0,
        'nav_unread_general': [],
        'nav_general_count': 0
    }