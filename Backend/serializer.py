from rest_framework import serializers
from .models import User, Category, Quiz, Question, Option, Result

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'is_teacher']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'question', 'option_text', 'is_correct', 'image']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, source='option_set', read_only=True)
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all(), write_only=True, required=False)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'question_text', 'image', 'options']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'category', 'time_limit', 'parent', 'questions']

class ResultSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    quiz = QuizSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    quiz_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Result
        fields = ['id', 'user', 'quiz', 'user_id', 'quiz_id', 'score', 'total_questions', 'time_taken', 'created_at']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        quiz_id = validated_data.pop('quiz_id')
        result = Result.objects.create(
            user_id=user_id,
            quiz_id=quiz_id,
            **validated_data
        )
        return result
