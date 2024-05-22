from django.urls import path
from .views import ClassifyView, PredictView

urlpatterns = [
  path('classify/', ClassifyView.as_view(), name='classify'),
  path('predict/', PredictView.as_view(), name='predict')
]