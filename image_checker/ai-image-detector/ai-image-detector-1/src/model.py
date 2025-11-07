class AIModel:
    def __init__(self, model_path):
        from tensorflow.keras.models import load_model
        self.model = load_model(model_path)

    def predict(self, image):
        import numpy as np
        # Preprocess the image as required by the model
        processed_image = self.preprocess_image(image)
        prediction = self.model.predict(np.expand_dims(processed_image, axis=0))
        return prediction

    def preprocess_image(self, image):
        from tensorflow.keras.preprocessing.image import img_to_array
        from tensorflow.keras.preprocessing.image import load_img
        from tensorflow.keras.applications.resnet50 import preprocess_input

        # Load and preprocess the image
        image = load_img(image, target_size=(224, 224))  # Adjust size as needed
        image = img_to_array(image)
        image = preprocess_input(image)
        return image

    def load_pretrained_model(self, model_path):
        from tensorflow.keras.models import load_model
        self.model = load_model(model_path)