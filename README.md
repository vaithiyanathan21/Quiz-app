# Quiz-app
A full-stack Quiz Application built using Django (Backend) and React (Frontend).  
Users can take quizzes, view scores, and teachers/admins can manage questions.

###  Quiz Taker
- User Registration & Login
- Attempt quizzes
- View score after submission
  
### Quiz adder / Admin
- Add, edit, delete questions
- Manage categories
- View student performance
  
## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Axios
- CSS

### Backend
- Django
- Django REST Framework

##installation
###Backend
-mkdir Backend
-cd Backend
-python -m venv env 
-env\script\activate
-pip install django
-pip install pillow
-django admin startproject project 
-python manage.py runserver
-python manage.py startapp myapp 
-python manage.py runserver

###frontend
-mkdir frontend
-cd frontend
-npm install 
-npm create vite@latest myapp -- --tamplate react
-npm install axios
-cd myapp
-npm run dev



