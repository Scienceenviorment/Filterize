def resize_image(image, target_size):
    from PIL import Image
    return image.resize(target_size, Image.ANTIALIAS)

def normalize_image(image):
    import numpy as np
    return (np.array(image) / 255.0).astype(np.float32)

def augment_image(image):
    from torchvision import transforms
    augmentation = transforms.Compose([
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
    ])
    return augmentation(image)

def preprocess_image(image, target_size):
    image = resize_image(image, target_size)
    image = normalize_image(image)
    return image