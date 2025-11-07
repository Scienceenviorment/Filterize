#!/usr/bin/env python3
"""
Quick Training Script for AI-Powered Misinformation Detection
============================================================
This script provides a fast way to train the model without Jupyter.
"""

import os
import sys
import time
import pandas as pd
import numpy as np
import tensorflow as tf
from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import warnings
warnings.filterwarnings('ignore')

# Set environment variables for optimal performance
os.environ['TF_USE_LEGACY_KERAS'] = '0'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

def quick_train():
    """Quick training function with optimized settings"""
    print("🚀 Starting Quick Training for Misinformation Detection")
    print("=" * 60)
    
    # Load data
    print("📊 Loading dataset...")
    df_fake = pd.read_csv("data/Fake.csv")
    df_true = pd.read_csv("data/True.csv")
    
    # Add labels and combine
    df_fake["label"] = 0  # fake
    df_true["label"] = 1  # true
    df = pd.concat([df_fake, df_true], axis=0).reset_index(drop=True)
    
    # Sample for faster training
    if len(df) > 5000:
        df = df.sample(n=5000, random_state=42).reset_index(drop=True)
        print(f"📈 Using {len(df)} samples for quick training")
    
    # Split data
    X = df["text"]
    y = df["label"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Setup tokenizer
    print("🔤 Setting up tokenizer...")
    tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    
    # Tokenize with minimal length for speed
    print("🔤 Tokenizing data...")
    train_encodings = tokenizer(
        list(X_train), 
        truncation=True, 
        padding=True, 
        max_length=64,  # Very short for speed
        return_tensors="tf"
    )
    
    test_encodings = tokenizer(
        list(X_test), 
        truncation=True, 
        padding=True, 
        max_length=64,
        return_tensors="tf"
    )
    
    # Create datasets
    print("📦 Creating datasets...")
    train_dataset = tf.data.Dataset.from_tensor_slices(
        (dict(train_encodings), list(y_train))
    ).batch(64)  # Large batch for speed
    
    test_dataset = tf.data.Dataset.from_tensor_slices(
        (dict(test_encodings), list(y_test))
    ).batch(64)
    
    # Setup model
    print("🤖 Setting up model...")
    model = TFDistilBertForSequenceClassification.from_pretrained(
        "distilbert-base-uncased", 
        num_labels=2
    )
    
    # Compile with high learning rate for fast convergence
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=["accuracy"]
    )
    
    # Train with minimal epochs
    print("🚀 Training model (1 epoch for speed)...")
    start_time = time.time()
    
    history = model.fit(
        train_dataset,
        validation_data=test_dataset,
        epochs=1,  # Just 1 epoch for quick results
        verbose=1
    )
    
    training_time = time.time() - start_time
    print(f"✅ Training completed in {training_time/60:.1f} minutes")
    
    # Evaluate
    print("📊 Evaluating model...")
    predictions = model.predict(test_dataset)
    y_pred = np.argmax(predictions.logits, axis=1)
    
    accuracy = np.mean(y_pred == y_test)
    print(f"📈 Test Accuracy: {accuracy:.4f}")
    
    # Save model
    print("💾 Saving model...")
    model.save_pretrained("models/quick_distilbert")
    tokenizer.save_pretrained("models/quick_distilbert")
    
    print("🎉 Quick training complete!")
    print(f"⏱️  Total time: {training_time/60:.1f} minutes")
    print(f"📊 Final accuracy: {accuracy:.4f}")
    print("💾 Model saved to: models/quick_distilbert")

if __name__ == "__main__":
    quick_train()