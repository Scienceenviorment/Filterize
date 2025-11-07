def resize_image(image, target_size):
    """Resize the input image to the target size."""
    from PIL import Image
    return image.resize(target_size, Image.ANTIALIAS)

def normalize_image(image):
    """Normalize the image data to the range [0, 1]."""
    import numpy as np
    return np.array(image) / 255.0

def augment_image(image):
    """Apply random augmentations to the image."""
    from torchvision import transforms
    augmentation = transforms.Compose([
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
    ])
    return augmentation(image)