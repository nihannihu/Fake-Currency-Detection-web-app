import tensorflow as tf
import numpy as np
import os

# Create a simple model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(1, activation='sigmoid', input_shape=(128*128*3,))
])

model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

# Create dummy data for testing
X_dummy = np.random.random((100, 128*128*3))
y_dummy = np.random.randint(2, size=(100, 1))

# Train on dummy data
model.fit(X_dummy, y_dummy, epochs=1)

# Save the model
model.save('currency_auth_model.h5')
print("Dummy model saved successfully!")