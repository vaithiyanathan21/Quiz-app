from django.urls import path
from .views import (
    UserViewSet, CategoryViewSet, QuizViewSet,
    QuestionViewSet, OptionViewSet, ResultViewSet,
    login_view, register_view
)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),

    path('users/', UserViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('users/<int:pk>/', UserViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path('categories/', CategoryViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('categories/<int:pk>/', CategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path('quizzes/', QuizViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('quizzes/<int:pk>/', QuizViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path('questions/', QuestionViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('questions/<int:pk>/', QuestionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path('options/', OptionViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('options/<int:pk>/', OptionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    path('results/', ResultViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('results/<int:pk>/', ResultViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
]
