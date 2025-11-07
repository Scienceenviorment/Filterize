class ImageDetector:
    def __init__(self, model_path):
        self.model = self.load_model(model_path)

    def load_model(self, model_path):
        # Load the pre-trained model from the specified path
        from keras.models import load_model
        return load_model(model_path)

    def load_image(self, image_path):
        # Load and preprocess the image
        from keras.preprocessing import image
        from preprocessing import preprocess_image
        img = image.load_img(image_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        return preprocess_image(img_array)

    def predict(self, image_path):
        # Predict whether the image is AI-generated or real
        img = self.load_image(image_path)
        import numpy as np
        img = np.expand_dims(img, axis=0)
        prediction = self.model.predict(img)
        return "AI-generated" if prediction[0][0] > 0.5 else "Real"

    def evaluate(self, test_images):
        # Evaluate the model on a set of test images
        results = {}
        for img_path in test_images:
            result = self.predict(img_path)
            results[img_path] = result
        return results