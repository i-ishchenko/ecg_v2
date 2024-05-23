from rest_framework import views, status
from rest_framework.response import Response
import neurokit2 as nk
import numpy as np

class ProcessView(views.APIView):
    def post(self, request, *args, **kwargs):
         try: 
            ecg = np.array(request.data.get("ecg"), dtype=float)
            sampling_rate = request.data.get("sampling_rate")
            signals, info = nk.ecg_process(ecg, sampling_rate)
            return Response({"ecg_clean": signals["ECG_Clean"]}, status=status.HTTP_200_OK)
         except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)