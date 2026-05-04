from django.contrib import admin
from .models import User, Category, Quiz, Question, Option, Result

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email')
    search_fields = ('name', 'email')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name',)

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'time_limit', 'parent')
    search_fields = ('title', 'category')
    list_filter = ('category', 'parent')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'quiz', 'question_text')
    search_fields = ('question_text',)
    list_filter = ('quiz',)

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'option_text', 'is_correct')
    list_filter = ('is_correct', 'question')

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'quiz', 'score', 'total_questions', 'time_taken', 'created_at')
    list_filter = ('quiz', 'user')
    search_fields = ('user__email', 'quiz__title')
