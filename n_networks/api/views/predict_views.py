import numpy as np
import tensorflow as tf
from tensorflow import keras
from rest_framework import views, status
from rest_framework.response import Response
from tensorflow.keras.metrics import MeanAbsoluteError
from tensorflow.keras.layers import Input

class PredictView(views.APIView):
    def post(self, request, *args, **kwargs):
        data = request.data.get('data')
        if not data:
            return Response({'error': 'Data not provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Prepare the input data
            X = self.process_input(data, 188)
            X = np.array(X, dtype=np.float32).reshape(1, -1)
            X_tensor = tf.convert_to_tensor(X, dtype=tf.float32)

            # Setup the model using TFSMLayer
            model_folder_path = './ECG_anomaly_saved_model'
            tfsmlayer = keras.layers.TFSMLayer(model_folder_path, call_endpoint='serving_default')

            # Build a model around the TFSMLayer
            inputs = Input(shape=(X_tensor.shape[1],))
            outputs = tfsmlayer(inputs)
            model = keras.Model(inputs, outputs)

            # Predict with the model
            pred_dict = model.predict(X_tensor, verbose=False)
            pred = pred_dict['output_1']  # Extract the correct output tensor from the dictionary

            # Compute Mean Absolute Error
            mae = MeanAbsoluteError()
            loss = mae(X_tensor, pred).numpy()  # Ensure both inputs are tensors
            threshold = 0.024
            result = {"isAbnormal": loss > threshold}  # Check if loss is below threshold

            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def process_input(self, X, num):
        n = len(X)
        desired_length = num
        if n < desired_length:
            padding = np.zeros(desired_length - n)
            X = np.concatenate((X, padding))
        elif n > desired_length:
            X = X[:desired_length]
        return np.array(X).reshape(1, desired_length) 
