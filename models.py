from django.db import models
from django.contrib.auth.hashers import make_password, check_password

# Create your models here.
class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    is_teacher = models.BooleanField(default=False)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
        

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name  

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='General Knowledge')
    time_limit = models.IntegerField(default=0, help_text="Time limit in minutes, 0 for no limit")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subquizzes')

    def __str__(self):
        return self.title

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    image = models.ImageField(upload_to='questions/', null=True, blank=True)

    def __str__(self):
        return self.question_text[:50]

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='option_set')
    option_text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    image = models.ImageField(upload_to='options/', null=True, blank=True)

class Result(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.IntegerField()
    total_questions = models.IntegerField()
    time_taken = models.IntegerField(default=0, help_text="Time taken in seconds")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.quiz.title} ({self.score}/{self.total_questions})"