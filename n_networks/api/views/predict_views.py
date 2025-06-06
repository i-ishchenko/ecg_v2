import numpy as np
import neurokit2 as nk
from scipy.signal import butter, filtfilt, resample, find_peaks
import tensorflow as tf
from tensorflow import keras
from rest_framework import views, status
from rest_framework.response import Response
from tensorflow.keras.metrics import MeanAbsoluteError
from tensorflow.keras.layers import Input
import pickle
import cloudpickle
import ig_explainer
from ig_explainer import integrated_gradients

class Autoencoder:
    def __init__(self):
        # Setup the model using TFSMLayer
        model_folder_path = './ECG_anomaly_saved_model'
        tfsmlayer = keras.layers.TFSMLayer(model_folder_path, call_endpoint='serving_default')

        # Build a model around the TFSMLayer
        inputs = Input(shape=(188,))
        outputs = tfsmlayer(inputs)
        self.model = keras.Model(inputs, outputs)

    def process_input(self, X, num):
        n = len(X)
        desired_length = num
        if n < desired_length:
            padding = np.zeros(desired_length - n)
            X = np.concatenate((X, padding))
        elif n > desired_length:
            X = X[:desired_length]
        return np.array(X).reshape(1, desired_length) 

    def predict(self, segment, i):
        X = self.process_input(segment, 188)
        X = np.array(X, dtype=np.float32).reshape(1, -1)
        X_tensor = tf.convert_to_tensor(X, dtype=tf.float32)

        # Predict with the model
        pred_dict = self.model.predict(X_tensor, verbose=False)
        pred = pred_dict['output_1']  # Extract the correct output tensor from the dictionary

        # Compute Mean Absolute Error
        mae = MeanAbsoluteError()
        loss = mae(X_tensor, pred).numpy()  # Ensure both inputs are tensors
        threshold = 0.052
        result = {"id": "R" + str(i + 1), "isNormal": loss <= threshold}  # Check if loss is below threshold
        return result


class CNN:
    def __init__(self):
        model_path = './ECG_classification_saved_model'
        model_layer = keras.layers.TFSMLayer(model_path, call_endpoint='serving_default')

        inputs = keras.Input(shape=(187, 1))
        outputs = model_layer(inputs)
        self.model = keras.Model(inputs, outputs)

    def process_input(self, X, num):
        n = len(X)
        desired_length = num
        if n < desired_length:
            padding = np.zeros(desired_length - n)
            X = np.concatenate((X, padding))
        elif n > desired_length:
            X = X[:desired_length]
        return np.array(X).reshape(1, desired_length, 1)

    def predict(self, segment, i):
        X = self.process_input(segment, 187)
        output_dict = self.model.predict(X, verbose=False)
        pred = output_dict["dense_5"].tolist()[0]  # Use flatten() if necessary and get the whole array
        result = {
            "id": "R" + str(i + 1),
            "isNormal": False,
            "S": round(pred[0] * 100),
            "V": round(pred[1] * 100),
            "F": round(pred[2] * 100),
            "Q": round(pred[3] * 100)
        }
        return result


class IGExplainer:
    def __init__(self):
        self.baseline = None
        self.timesteps = None
        self.m_steps = None
        self.model = None
        self.load_explainer()
    
    def load_explainer(self):
        try:
            # Load the CNN model
            model_path = './ECG_classification_saved_model'
            model_layer = keras.layers.TFSMLayer(model_path, call_endpoint='serving_default')
            inputs = keras.Input(shape=(187, 1))
            outputs = model_layer(inputs)
            self.model = keras.Model(inputs, outputs)
            
            # Assign model to the global variable for gradient computation
            ig_explainer.ig_explainer_callable = self.model
            
            # Load IG metadata
            with open('ig_metadata.pkl', 'rb') as f:
                data = cloudpickle.load(f)
                self.baseline = data['baseline']    # shape (1, timesteps, 1)
                self.timesteps = data['timesteps']  # e.g. 187
                self.m_steps = data['m_steps']      # e.g. 50
                
        except Exception as e:
            print(f"Error loading IG explainer: {e}")
            self.baseline = None
    
    def explain_prediction(self, segment):
        if self.baseline is None or self.model is None:
            return None
        
        try:
            # Ensure segment is exactly the right number of timesteps
            if len(segment) != self.timesteps:
                # Resize segment to match the expected timesteps
                segment_resized = resample(segment, self.timesteps)
            else:
                segment_resized = segment
            
            # Prepare input: shape = (1, timesteps, 1)
            x_input = segment_resized.reshape(1, self.timesteps, 1).astype(np.float32)
            
            # Get model predictions for IG computation
            probs = self.model.predict(x_input, verbose=False)
            if isinstance(probs, dict):
                probs = probs['dense_5']  # Extract the dense_5 output
            pred_idx = int(np.argmax(probs, axis=1)[0])
            
            class_names = ['S', 'V', 'F', 'Q']
            pred_name = class_names[pred_idx]
            
            # Compute IG attributions
            ig_attr = integrated_gradients(
                x_input,
                self.baseline.astype(np.float32),
                target_class_idx=pred_idx,
                m_steps=self.m_steps
            )  # shape = (timesteps,)
            
            # Completeness check
            f_x = probs[0, pred_idx]
            f_baseline = self.model.predict(self.baseline, verbose=False)
            if isinstance(f_baseline, dict):
                f_baseline = f_baseline['dense_5']
            f_baseline = f_baseline[0, pred_idx]
            ig_sum = float(np.sum(ig_attr))
            diff = float(abs((f_x - f_baseline) - ig_sum))
            
            # Convert to frontend-friendly format similar to LIME
            explanation_data = {
                'predicted_class': pred_name,
                'class_index': pred_idx,
                'probabilities': probs[0].tolist(),
                'ig_attributions': ig_attr.tolist(),
                'feature_importance': [
                    {
                        'feature': f"t{i}",
                        'importance': float(attr)
                    }
                    for i, attr in enumerate(ig_attr)
                ],
                'local_prediction': probs[0].tolist(),
                'completeness': {
                    'f_x': float(f_x),
                    'f_baseline': float(f_baseline),
                    'f_x_minus_f_baseline': float(f_x - f_baseline),
                    'sum_ig': ig_sum,
                    'difference': diff
                }
            }
            
            return explanation_data
            
        except Exception as e:
            print(f"Error generating IG explanation: {e}")
            return None


class PredictView(views.APIView):
    def post(self, request, *args, **kwargs):
        ecg = np.array(request.data.get("ecg"), dtype=float)
        sampling_rate = request.data.get("sampling_rate")
        cleaning_method = request.data.get("cleaning_method")
    
        segments = self.segment(ecg, sampling_rate, cleaning_method)

        results = []

        autoencoder = Autoencoder()
        cnn = CNN()

        for i in range(len(segments)):
            try:
                segment = self.normalize_data(segments[i])
                result = autoencoder.predict(segment, i)
                
                if(not result["isNormal"]):
                    result = cnn.predict(segment, i)
                    # Store segment data for later explanation generation
                    result["segment_data"] = segment.tolist()

                results.append(result)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"predictions": results}, status=status.HTTP_200_OK)

    def segment(self, ecg, sampling_rate, cleaning_method):
        data125 = self.downsample_ecg(ecg, sampling_rate, 125)

        data125_filtered = self.butter_filter(data125, 0.5, 40, 125, 2)
        signals, info = nk.ecg_process(data125_filtered, 125, cleaning_method)

        r_peaks = info['ECG_R_Peaks']

        rr_intervals = np.diff(r_peaks)
        median_rr = np.median(rr_intervals)

        segment_length = int(1.2 * median_rr)

        segments = []
        for peak in r_peaks:
            start = max(0, peak - segment_length // 2)
            end = min(len(data125_filtered), start + segment_length)

            if end - start < segment_length:
                segment = np.pad(data125_filtered[start:end], (0, segment_length - (end - start)), 'constant', constant_values=(0, 0))
            else:
                segment = data125_filtered[start:end]

            segments.append(segment)
        
        return segments

    def butter_filter(self, data, lowcut, highcut, fs, order=5):
        nyq = 0.5 * fs
        low = lowcut / nyq
        high = highcut / nyq
        b, a = butter(order, [low, high], btype='band')
        y = filtfilt(b, a, data)
        return y

    def downsample_ecg(self, data, old_freq, new_freq):
        # Apply a bandpass filter to retain frequencies between 0.5Hz and half of the new sampling rate
        clean_data = self.butter_filter(data, 0.5, new_freq / 2, old_freq, order=2)

        # Calculate the number of samples in the downsampled data
        num_samples = int(len(data) * (new_freq / old_freq))

        # Resample the data
        downsampled_data = resample(clean_data, num_samples)
        return downsampled_data

    def normalize_data(self, data):
        return (data - np.min(data)) / (np.max(data) - np.min(data))


class ExplainView(views.APIView):
    def post(self, request, *args, **kwargs):
        try:
            segment_data = request.data.get("segment_data")
            
            if not segment_data:
                return Response({'error': 'segment_data is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Convert to numpy array and normalize
            segment = np.array(segment_data, dtype=float)
            
            # Initialize IG explainer
            ig_explainer = IGExplainer()
            
            if ig_explainer.baseline is None:
                return Response({'error': 'IG explainer not available'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Generate IG explanation
            explanation = ig_explainer.explain_prediction(segment)
            
            if explanation:
                return Response({"explanation": explanation}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Failed to generate explanation'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
