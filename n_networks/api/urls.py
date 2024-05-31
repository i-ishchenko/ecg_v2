from django.urls import path
from .views import PredictView, ProcessView

urlpatterns = [
  path('predict/', PredictView.as_view(), name='predict'),
  path('process/', ProcessView.as_view(), name='process')
]