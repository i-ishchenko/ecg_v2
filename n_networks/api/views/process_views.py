from rest_framework import views, status
from rest_framework.response import Response
import neurokit2 as nk
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
import base64

class ProcessView(views.APIView):
    def post(self, request, *args, **kwargs):
         try: 
            ecg = np.array(request.data.get("ecg"), dtype=float)
            sampling_rate = request.data.get("sampling_rate")
            signals, info = nk.ecg_process(ecg, sampling_rate)
            nk.ecg_plot(signals, info)
            fig = plt.gcf()
            fig.set_size_inches(16, 10, forward=True)
            
            # Save the figure to a BytesIO object instead of a file
            buf = BytesIO()
            fig.savefig(buf, format='png')
            buf.seek(0)
            image_base64 = base64.b64encode(buf.read()).decode('utf-8')

            return Response(
               {
                  "ecg_clean": signals["ECG_Clean"], 
                  "r_peaks": signals["ECG_R_Peaks"], 
                  "p_peaks": signals["ECG_P_Peaks"],
                  "q_peaks": signals["ECG_Q_Peaks"],
                  "s_peaks": signals["ECG_S_Peaks"],
                  "t_peaks": signals["ECG_T_Peaks"],
                  "image": image_base64 
               }, status=status.HTTP_200_OK)
         except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)