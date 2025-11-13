import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import os
import numpy as np

def train_model():
    # Define image size and batch size
    IMG_SIZE = 128
    BATCH_SIZE = 32

    # Define paths to our dataset directories
    train_dir = './dataset/train'
    valid_dir = './dataset/valid'
    test_dir = './dataset/test'

    # Check if dataset directories exist
    if not os.path.exists(train_dir) or not os.path.exists(valid_dir) or not os.path.exists(test_dir):
        print("Dataset directories not found. Please ensure the following directories exist:")
        print("- ./dataset/train/")
        print("- ./dataset/valid/")
        print("- ./dataset/test/")
        print("Each should contain 'real/' and 'fake/' subdirectories.")
        return

    # Create data generators with augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        shear_range=0.2,
        fill_mode='nearest'
    )

    # Validation and test data should only be rescaled
    valid_datagen = ImageDataGenerator(rescale=1./255)
    test_datagen = ImageDataGenerator(rescale=1./255)

    # Create generators
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='binary',
        classes=['fake', 'real']  # Ensure consistent labeling (0=fake, 1=real)
    )
    
    # Print class indices for verification
    print("Training class indices:", train_generator.class_indices)
    
    # Calculate class weights to handle imbalance
    class_counts = train_generator.classes.shape[0]
    fake_count = np.sum(train_generator.classes == 0)  # fake class is 0
    real_count = np.sum(train_generator.classes == 1)  # real class is 1
    
    print(f"Fake images: {fake_count}, Real images: {real_count}")
    
    # Calculate class weights (inverse frequency)
    if fake_count > 0 and real_count > 0:
        fake_weight = class_counts / (2.0 * fake_count)
        real_weight = class_counts / (2.0 * real_count)
        class_weights = {0: fake_weight, 1: real_weight}
        print(f"Class weights: {class_weights}")
    else:
        class_weights = None
        print("Could not calculate class weights")

    validation_generator = valid_datagen.flow_from_directory(
        valid_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='binary',
        classes=['fake', 'real']
    )
    
    print("Validation class indices:", validation_generator.class_indices)

    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='binary',
        classes=['fake', 'real']
    )
    
    print("Test class indices:", test_generator.class_indices)

    # Create improved model
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
        MaxPooling2D(2, 2),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Flatten(),
        Dropout(0.5),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(1, activation='sigmoid')
    ])

    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )

    # Display model summary
    model.summary()

    # Train model with class weights
    print("Starting training with class weights...")
    history = model.fit(
        train_generator,
        epochs=15,
        validation_data=validation_generator,
        class_weight=class_weights,
        verbose=1
    )

    # Evaluate on test set
    print("Evaluating on test set...")
    test_loss, test_accuracy = model.evaluate(test_generator)
    print(f"Test Accuracy: {test_accuracy:.4f}")

    # Save model
    model.save('currency_auth_model.h5')
    print("Model saved as currency_auth_model.h5")

    return model

if __name__ == "__main__":
    train_model()