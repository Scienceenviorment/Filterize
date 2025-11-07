from setuptools import setup, find_packages

setup(
    name='ai-image-detector',
    version='0.1.0',
    author='Your Name',
    author_email='your.email@example.com',
    description='A Python module to detect whether an image is AI-generated or real.',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        'numpy',
        'opencv-python',
        'tensorflow',  # or 'torch' depending on your model
        'Pillow',
        'scikit-learn',
        'matplotlib',
        'jupyter',  # for the notebook
    ],
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)