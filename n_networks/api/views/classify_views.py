import numpy as np
import tensorflow as tf
from tensorflow import keras
from rest_framework import views, status
from rest_framework.response import Response
from tensorflow.keras.metrics import MeanAbsoluteError
from tensorflow.keras.layers import Input

class ClassifyView(views.APIView):
    def post(self, request, *args, **kwargs):
        try:
            X = request.data.get("data")
            if X is None or not isinstance(X, list):
                return Response({'error': 'Data not provided or is not a list'}, status=status.HTTP_400_BAD_REQUEST)
            
            X = self.process_input([float(val) for val in X], 187)  # Ensure conversion to float
            prediction = self.predict(X)
            return Response({"value": prediction}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def predict(self, X):
        model_path = './ECG_classification_saved_model'
        model_layer = keras.layers.TFSMLayer(model_path, call_endpoint='serving_default')

        inputs = keras.Input(shape=(187, 1))
        outputs = model_layer(inputs)
        model = keras.Model(inputs, outputs)

        output_dict = model.predict(X, verbose=False)
        pred = output_dict["dense_5"].tolist()[0]  # Use flatten() if necessary and get the whole array
        return pred  # Return the full prediction array

    def process_input(self, X, num):
        n = len(X)
        desired_length = num
        if n < desired_length:
            padding = np.zeros(desired_length - n)
            X = np.concatenate((X, padding))
        elif n > desired_length:
            X = X[:desired_length]
        return np.array(X).reshape(1, desired_length, 1)  # Add an extra dimension for 'channels'
