import numpy as np
import tensorflow as tf

# Global variable to hold the model reference
ig_explainer_callable = None

@tf.function
def get_gradient(at_input: tf.Tensor, target_class_idx: int) -> tf.Tensor:
    """
    at_input:   Tensor of shape (1, T, 1)
    target_class_idx: integer in [0..num_classes-1]
    returns:    gradients of model's logit[target_class_idx] w.r.t at_input
                shape = (1, T, 1)
    """
    with tf.GradientTape() as tape:
        tape.watch(at_input)
        logits = ig_explainer_callable(at_input, training=False) 
        # Extract the dense_5 output which contains the class probabilities
        if isinstance(logits, dict):
            class_probs = logits['dense_5']  # Shape: (1, 4) for S,V,F,Q classes
        else:
            class_probs = logits
        score = class_probs[:, target_class_idx]  # Shape: (1,)
    grads = tape.gradient(score, at_input)  # Shape: (1, T, 1)
    return grads

def integrated_gradients(
    x_input: np.ndarray,         # shape = (1, T, 1)
    baseline: np.ndarray,        # shape = (1, T, 1)
    target_class_idx: int,
    m_steps: int = 50
) -> np.ndarray:
    """
    Returns an attribution vector of shape (T,) for x_input.
    """
    # 1) Build scaled inputs: (m_steps+1, T, 1)
    scaled_inputs = [
        baseline + (float(k) / m_steps) * (x_input - baseline)
        for k in range(m_steps + 1)
    ]
    scaled_inputs = tf.concat(scaled_inputs, axis=0)  # (m_steps+1, T, 1)

    # 2) Compute gradients at each scaled point
    grads_list = []
    for k in range(m_steps + 1):
        inp_k = tf.expand_dims(scaled_inputs[k], axis=0)  # (1, T, 1)
        grad_k = get_gradient(inp_k, target_class_idx)     # (1, T, 1)
        grads_list.append(grad_k)
    grads_stack = tf.concat(grads_list, axis=0)           # (m_steps+1, T, 1)

    # 3) Approximate the path integral by averaging
    avg_grads = tf.reduce_mean(grads_stack, axis=0)       # (T, 1)

    # 4) Attribution = (x - baseline) * avg_grads
    diff = x_input[0] - baseline[0]                       # (T, 1)
    attributions = diff * avg_grads                        # (T, 1)

    return attributions[..., 0].numpy()                    # (T,) 