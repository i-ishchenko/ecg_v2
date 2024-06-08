import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  patient: {
    type: String,
    required: [true, "Must specify patients name"]
  },
  note: {
    type: String,
  },
  date: {
    type: Date,
    default: () => Date.now(),
  },
  ecg: {
    type: {
      cleaning_method: {
        type: String,
        required: [true, "ECG must have cleaning method specified"],
      },
      sampling_frequency: {
        type: Number,
        required: [true, "Sampling rate must be specified"],
      },
      ecg_raw: {
        type: [Number],
        required: [true, "Must provide initial ecg signal"],
      },
      ecg_clean: {
        type: [Number],
        required: [true, "Must provide processed ecg signal"],
      },
      r_peaks: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Must include array of R peaks"],
      },
      p_peaks: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Must include array of P peaks"],
      },
      q_peaks: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Must include array of Q peaks"],
      },
      s_peaks: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Must include array of S peaks"],
      },
      t_peaks: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Must include array of T peaks"],
      },
      image: {
        type: String,
        required: [true, "Base64 image must be included"],
      },
    },
    required: [true, "Must provide ecg data"],
  },
  predictions: {
    type: [
      {
        id: {
          type: String,
          required: [true, "Prediction must have an id"],
        },
        isNormal: {
          type: Boolean,
          required: [true, "Prediction must have the isNormal field set"],
        },
        S: {
          type: mongoose.Schema.Types.Mixed,
        },
        F: {
          type: mongoose.Schema.Types.Mixed,
        },
        Q: {
          type: mongoose.Schema.Types.Mixed,
        },
        V: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],
    required: [true, "Predictions are required"],
  },
});

const Analysis =
  mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

export default Analysis;
