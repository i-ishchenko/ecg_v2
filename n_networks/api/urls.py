from django.urls import path
from .views import PredictView, ProcessView, ExplainView

urlpatterns = [
  path('predict/', PredictView.as_view(), name='predict'),
  path('process/', ProcessView.as_view(), name='process'),
  path('explain/', ExplainView.as_view(), name='explain')
]