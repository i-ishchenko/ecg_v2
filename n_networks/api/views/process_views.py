from rest_framework import views, status
from rest_framework.response import Response

class ProcessView(views.APIView):
    def post(self, request, *args, **kwargs):
         return Response({"value": "hi"}, status=status.HTTP_200_OK)
