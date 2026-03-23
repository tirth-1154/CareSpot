from django.db import models

class tblState(models.Model):
    stateID=models.AutoField(primary_key=True)
    stateName=models.TextField(max_length=50)
    def __str__(self):
        return '%d'' %s' % (self.stateID,self.stateName)

class tblCity(models.Model):
    cityID=models.AutoField(primary_key=True)
    cityName=models.TextField(max_length=50)
    stateID=models.ForeignKey(tblState,on_delete=models.CASCADE)
    def __str__(self):
        return '%d'' %s' % (self.cityID,self.cityName)    

class tblCategory(models.Model):
    categoryID=models.AutoField(primary_key=True)
    categoryName=models.TextField(max_length=50)
    def __str__(self):
        return '%d'' %s' % (self.categoryID,self.categoryName)

class tblSubcategory(models.Model):
    subcategoryID=models.AutoField(primary_key=True)
    subcategoryName=models.TextField(max_length=50)
    CategoryID=models.ForeignKey(tblCategory,on_delete=models.CASCADE)
    def __str__(self):
        return '%d'' %s' % (self.subcategoryID,self.subcategoryName)

class tblUser(models.Model):
    userID=models.AutoField(primary_key=True)
    userName=models.TextField(max_length=50)
    password=models.TextField(max_length=10)
    registrationDT=models.DateTimeField(auto_now_add=True)
    profilePic=models.ImageField(upload_to='images/')
    email=models.TextField(max_length=100)
    mobileNumber=models.TextField(max_length=15)
    cityID=models.ForeignKey(tblCity,on_delete=models.CASCADE)  
    IsDoctor=models.BooleanField(default=False)
    last_seen=models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return '%d'' %s' % (self.userID,self.userName)

class tblDoctor(models.Model):
    doctorID=models.AutoField(primary_key=True) 
    userID=models.ForeignKey(tblUser,on_delete=models.CASCADE)
    displayName=models.TextField(max_length=50)
    displayContact=models.TextField(max_length=15)
    bio=models.TextField(max_length=500)
    subcategoryID=models.ForeignKey(tblSubcategory,on_delete=models.CASCADE)
    displayAddress=models.TextField(max_length=100)
    yearOfExperience=models.IntegerField()
    licenseNo=models.TextField(max_length=50)
    documents=models.FileField(upload_to='doctor_documents/')
    mode=models.IntegerField(default=1)
    approval_status = models.CharField(max_length=20, default='pending', choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')])
    def __str__(self):
        return '%d'' %s' % (self.doctorID,self.displayName)

class tblDoctorImages(models.Model):
    doctorImageID=models.AutoField(primary_key=True)
    doctorID=models.ForeignKey(tblDoctor,on_delete=models.CASCADE)
    imageURL=models.ImageField(upload_to='doctor_images/')
    def __str__(self):
        return '%d'' %s' % (self.doctorImageID,self.doctorID)
        
class tblDoctorPost(models.Model):
    doctorPostID=models.AutoField(primary_key=True)
    doctorID=models.ForeignKey(tblDoctor,on_delete=models.CASCADE)
    title=models.TextField(max_length=100)
    description=models.TextField(max_length=500)
    thumbnail=models.ImageField(upload_to='images/')
    createDT=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return '%d'' %s' % (self.doctorPostID,self.title)

class tblComments(models.Model):
    commentsID=models.AutoField(primary_key=True)
    comment=models.TextField(max_length=500)
    userID=models.ForeignKey(tblUser,on_delete=models.CASCADE)
    doctorPostID=models.ForeignKey(tblDoctorPost,on_delete=models.CASCADE)
    createdDT=models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True,related_name='replies')
    def __str__(self):
        return '%d'' %s' % (self.commentsID,self.comment)

class tblClient(models.Model):
    clientID=models.AutoField(primary_key=True)
    userID=models.ForeignKey(tblUser,on_delete=models.CASCADE)
    name=models.TextField(max_length=50)
    description=models.TextField(max_length=500)
    address=models.TextField(max_length=100)
    dob=models.DateField()
    gender=models.TextField(max_length=10)
    bloodGroup=models.TextField(max_length=10)
    def __str__(self):
        return '%d'' %s' % (self.clientID,self.name)

class tblAppointment(models.Model):
    appointmentID=models.AutoField(primary_key=True)
    clientID=models.ForeignKey(tblClient,on_delete=models.CASCADE)
    doctorID=models.ForeignKey(tblDoctor,on_delete=models.CASCADE)
    appointmentDate=models.DateField()
    appointmentTime=models.TimeField()
    mode=models.CharField(max_length=20, default='offline', choices=[('online', 'Online'), ('offline', 'Offline')])
    meetLink=models.TextField(max_length=500, null=True, blank=True)
    isAccepted=models.BooleanField(default=False)
    isRejected=models.BooleanField(default=False)
    createdDT=models.DateTimeField(auto_now_add=True, null=True)
    def __str__(self):
        return '%d'' %s' % (self.appointmentID,self.clientID)

class tblclientHistory(models.Model):
    clientHistoryID=models.AutoField(primary_key=True)
    clientID=models.ForeignKey(tblClient,on_delete=models.CASCADE)
    doctorID=models.ForeignKey(tblDoctor,on_delete=models.CASCADE)
    title = models.TextField(max_length=100, null=True, blank=True)
    symptoms = models.TextField(max_length=500, null=True, blank=True)
    diagnosis = models.TextField(max_length=500, null=True, blank=True)
    prescription=models.TextField(max_length=500)
    additionalNotes = models.TextField(max_length=500, null=True, blank=True)
    createdDT=models.DateTimeField(auto_now_add=True)
    isMarkedSpecial=models.BooleanField(default=False)
    def _str_(self):
        return '%d'' %s' % (self.clientHistoryID,self.clientID)

class tblReview(models.Model):
    reviewID=models.AutoField(primary_key=True)
    doctorID=models.ForeignKey(tblDoctor,on_delete=models.CASCADE)
    userID=models.ForeignKey(tblUser,on_delete=models.CASCADE)
    rating=models.IntegerField()
    review=models.TextField(max_length=500) 
    createdDT=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return '%d'' %s' % (self.reviewID,self.review)

class tblchat(models.Model):
    chatID=models.AutoField(primary_key=True)
    senderID=models.IntegerField()
    receiverID=models.IntegerField()
    message=models.TextField(max_length=500)
    createdDT=models.DateTimeField(auto_now_add=True)
    isRead=models.BooleanField(default=False)   
    def __str__(self):
        return '%d'' %s' % (self.chatID,self.message)

class tblnotification(models.Model):
    notificationID=models.AutoField(primary_key=True)
    userID=models.ForeignKey(tblUser,on_delete=models.CASCADE)
    senderID=models.IntegerField(null=True, blank=True)
    message=models.TextField(max_length=500)
    createdDT=models.DateTimeField(auto_now_add=True)
    isRead=models.BooleanField(default=False)  
    def __str__(self):
        return '%d'' %s' % (self.notificationID,self.message)

class tblFollow(models.Model):
    followID = models.AutoField(primary_key=True)
    userID = models.ForeignKey(tblUser, on_delete=models.CASCADE)
    doctorID = models.ForeignKey(tblDoctor, on_delete=models.CASCADE)
    followedDT = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('userID', 'doctorID')
    def __str__(self):
        return '%d follows %d' % (self.userID.userID, self.doctorID.doctorID)
class tblDoctorAttachment(models.Model):
    attachmentID=models.AutoField(primary_key=True)
    doctorID=models.ForeignKey(tblDoctor,on_delete=models.CASCADE)
    attachment=models.FileField(upload_to='attachments/')
    def __str__(self):
        return '%d'' %s' % (self.attachmentID,self.doctorID)

class tblDoctorSchedule(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    scheduleID   = models.AutoField(primary_key=True)
    doctorID     = models.ForeignKey(tblDoctor, on_delete=models.CASCADE)
    day_of_week  = models.IntegerField(choices=DAY_CHOICES)
    start_time   = models.TimeField(null=True, blank=True)
    end_time     = models.TimeField(null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('doctorID', 'day_of_week')
        ordering = ['day_of_week']

    def __str__(self):
        return f'{self.doctorID.displayName} - {self.get_day_of_week_display()}'

class tblDoctorCaseStudy(models.Model):
    caseStudyID = models.AutoField(primary_key=True)
    doctorID = models.ForeignKey(tblDoctor, on_delete=models.CASCADE)
    clientID = models.ForeignKey(tblClient, on_delete=models.CASCADE)
    title = models.TextField(max_length=150)
    symptoms = models.TextField(max_length=1000)
    diagnosis = models.TextField(max_length=1000)
    treatment = models.TextField(max_length=1000)
    notes = models.TextField(max_length=1500, blank=True)
    createdDT = models.DateTimeField(auto_now_add=True)
    updatedDT = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.title} - {self.clientID.name}'

class OTP(models.Model):
    user = models.ForeignKey(tblUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        from django.utils import timezone
        from datetime import timedelta
        # 5 minutes expiry
        return timezone.now() > self.created_at + timedelta(minutes=5)
