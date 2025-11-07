"""
Multi-Media AI Detection Module for Filterize

This module handles AI detection for images, videos, and web links.
"""

import os
import re
import json
import hashlib
import requests
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import tempfile
from urllib.parse import urlparse
import base64


class MediaAIDetector:
    """AI detection for images, videos, and web content."""
    
    def __init__(self):
        self.cache_dir = Path('cache') / 'media'
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
    def analyze_image(self, image_data: bytes, filename: str = None) -> Dict:
        """
        Analyze image for AI generation indicators.
        
        Args:
            image_data: Raw image bytes
            filename: Original filename if available
            
        Returns:
            AI detection results for the image
        """
        try:
            # Import PIL for image analysis
            from PIL import Image, ExifTags
            import io
            
            # Load image
            image = Image.open(io.BytesIO(image_data))
            
            result = {
                'ai_probability': 0.0,
                'confidence': 0.0,
                'detection_methods': [],
                'flags': [],
                'explanation': '',
                'metadata_analysis': {},
                'visual_analysis': {}
            }
            
            # Method 1: EXIF/Metadata Analysis
            metadata_result = self._analyze_image_metadata(image, filename)
            result['metadata_analysis'] = metadata_result
            if metadata_result['indicates_ai']:
                result['ai_probability'] += 0.4
                result['detection_methods'].append('metadata')
                result['flags'].extend(metadata_result['flags'])
            
            # Method 2: Visual Pattern Analysis
            visual_result = self._analyze_visual_patterns(image)
            result['visual_analysis'] = visual_result
            if visual_result['indicates_ai']:
                result['ai_probability'] += 0.3
                result['detection_methods'].append('visual_patterns')
                result['flags'].extend(visual_result['flags'])
            
            # Method 3: Statistical Analysis
            stats_result = self._analyze_image_statistics(image)
            if stats_result['indicates_ai']:
                result['ai_probability'] += 0.2
                result['detection_methods'].append('statistical')
                result['flags'].extend(stats_result['flags'])
            
            # Method 4: Compression Artifacts Analysis
            compression_result = self._analyze_compression_artifacts(image_data)
            if compression_result['indicates_ai']:
                result['ai_probability'] += 0.1
                result['detection_methods'].append('compression')
                result['flags'].extend(compression_result['flags'])
            
            result['ai_probability'] = min(1.0, result['ai_probability'])
            result['confidence'] = len(result['detection_methods']) / 4.0
            result['explanation'] = self._generate_image_explanation(result)
            
            return result
            
        except ImportError:
            return {
                'error': 'PIL/Pillow required for image analysis',
                'ai_probability': 0.0,
                'confidence': 0.0
            }
        except Exception as e:
            return {
                'error': f'Image analysis failed: {str(e)}',
                'ai_probability': 0.0,
                'confidence': 0.0
            }
    
    def analyze_video(self, video_path: str) -> Dict:
        """
        Analyze video for AI generation indicators.
        
        Args:
            video_path: Path to video file
            
        Returns:
            AI detection results for the video
        """
        result = {
            'ai_probability': 0.0,
            'confidence': 0.0,
            'detection_methods': [],
            'flags': [],
            'explanation': '',
            'frame_analysis': {},
            'motion_analysis': {}
        }
        
        try:
            # Basic video analysis without heavy dependencies
            # Check file size and basic properties
            file_size = os.path.getsize(video_path)
            
            # Heuristic analysis based on file characteristics
            if file_size < 1024 * 1024:  # Very small video files
                result['flags'].append('suspiciously_small')
                result['ai_probability'] += 0.2
                result['detection_methods'].append('file_analysis')
            
            # Check filename patterns common in AI-generated videos
            filename = os.path.basename(video_path).lower()
            ai_patterns = [
                'generated', 'synthetic', 'ai_', 'deepfake', 'artificial',
                'stable_video', 'runway', 'pika_labs'
            ]
            
            for pattern in ai_patterns:
                if pattern in filename:
                    result['flags'].append(f'filename_indicator_{pattern}')
                    result['ai_probability'] += 0.3
                    result['detection_methods'].append('filename')
                    break
            
            result['confidence'] = len(result['detection_methods']) / 3.0
            result['explanation'] = self._generate_video_explanation(result)
            
            return result
            
        except Exception as e:
            return {
                'error': f'Video analysis failed: {str(e)}',
                'ai_probability': 0.0,
                'confidence': 0.0
            }
    
    def analyze_url(self, url: str) -> Dict:
        """
        Analyze content from a URL for AI generation.
        
        Args:
            url: URL to analyze
            
        Returns:
            AI detection results for the URL content
        """
        result = {
            'ai_probability': 0.0,
            'confidence': 0.0,
            'detection_methods': [],
            'flags': [],
            'explanation': '',
            'content_type': 'unknown',
            'extracted_content': ''
        }
        
        try:
            # Fetch URL content
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10, stream=True)
            response.raise_for_status()
            
            content_type = response.headers.get('content-type', '').lower()
            result['content_type'] = content_type
            
            if 'text/html' in content_type:
                # HTML content analysis
                html_content = response.text
                extracted_text = self._extract_text_from_html(html_content)
                result['extracted_content'] = extracted_text[:500]  # First 500 chars
                
                # Analyze extracted text using existing AI detection
                from ai_detection import analyze_ai_content
                text_analysis = analyze_ai_content(extracted_text)
                
                result.update({
                    'ai_probability': text_analysis['ai_probability'],
                    'confidence': text_analysis['confidence'],
                    'detection_methods': text_analysis['detection_methods'],
                    'flags': text_analysis['flags'],
                    'explanation': text_analysis['explanation']
                })
                
                # Additional URL-specific analysis
                url_analysis = self._analyze_url_patterns(url, html_content)
                if url_analysis['indicates_ai']:
                    result['ai_probability'] = min(1.0, result['ai_probability'] + 0.2)
                    result['flags'].extend(url_analysis['flags'])
                    if 'url_patterns' not in result['detection_methods']:
                        result['detection_methods'].append('url_patterns')
                
            elif 'image/' in content_type:
                # Image URL - download and analyze
                image_data = response.content
                image_analysis = self.analyze_image(image_data, url)
                result.update(image_analysis)
                
            else:
                result['flags'].append('unsupported_content_type')
                result['explanation'] = f'Content type {content_type} not supported for AI analysis'
            
            return result
            
        except requests.RequestException as e:
            return {
                'error': f'Failed to fetch URL: {str(e)}',
                'ai_probability': 0.0,
                'confidence': 0.0
            }
        except Exception as e:
            return {
                'error': f'URL analysis failed: {str(e)}',
                'ai_probability': 0.0,
                'confidence': 0.0
            }
    
    def _analyze_image_metadata(self, image, filename: str = None) -> Dict:
        """Analyze image metadata for AI generation indicators."""
        try:
            from PIL.ExifTags import TAGS
            
            flags = []
            indicates_ai = False
            
            # Check EXIF data
            exif_data = image.getexif()
            exif_dict = {}
            
            for tag_id, value in exif_data.items():
                tag = TAGS.get(tag_id, tag_id)
                exif_dict[tag] = value
            
            # Look for AI generation software in EXIF
            ai_software_indicators = [
                'midjourney', 'dall-e', 'dalle', 'stable diffusion', 'firefly',
                'leonardo', 'runway', 'artbreeder', 'deepai', 'nightcafe'
            ]
            
            software = str(exif_dict.get('Software', '')).lower()
            for indicator in ai_software_indicators:
                if indicator in software:
                    flags.append(f'ai_software_{indicator.replace(" ", "_")}')
                    indicates_ai = True
            
            # Check for missing typical camera EXIF data
            camera_tags = ['Make', 'Model', 'DateTime', 'Flash', 'FocalLength']
            missing_camera_data = sum(1 for tag in camera_tags if tag not in exif_dict)
            
            if missing_camera_data >= 3:
                flags.append('missing_camera_metadata')
                indicates_ai = True
            
            # Check filename patterns
            if filename:
                filename_lower = filename.lower()
                ai_filename_patterns = [
                    'generated', 'ai_', 'synthetic', 'midjourney', 'dalle',
                    'stable_diffusion', 'sd_', 'img2img'
                ]
                
                for pattern in ai_filename_patterns:
                    if pattern in filename_lower:
                        flags.append(f'ai_filename_{pattern}')
                        indicates_ai = True
            
            return {
                'indicates_ai': indicates_ai,
                'flags': flags,
                'exif_data': exif_dict,
                'missing_camera_tags': missing_camera_data
            }
            
        except Exception:
            return {'indicates_ai': False, 'flags': [], 'exif_data': {}}
    
    def _analyze_visual_patterns(self, image) -> Dict:
        """Analyze visual patterns that might indicate AI generation."""
        try:
            import numpy as np
            
            # Convert to numpy array for analysis
            img_array = np.array(image.convert('RGB'))
            
            flags = []
            indicates_ai = False
            
            # Check for perfect symmetry (common in AI art)
            height, width = img_array.shape[:2]
            if height > 100 and width > 100:
                left_half = img_array[:, :width//2]
                right_half = np.fliplr(img_array[:, width//2:])
                
                if left_half.shape == right_half.shape:
                    similarity = np.mean(np.abs(left_half - right_half))
                    if similarity < 10:  # Very similar halves
                        flags.append('perfect_symmetry')
                        indicates_ai = True
            
            # Check for unnatural color distributions
            mean_colors = np.mean(img_array, axis=(0, 1))
            std_colors = np.std(img_array, axis=(0, 1))
            
            # AI images often have very balanced color channels
            if np.std(mean_colors) < 5 and np.mean(std_colors) > 60:
                flags.append('balanced_color_channels')
                indicates_ai = True
            
            # Check for unusual aspect ratios common in AI generation
            aspect_ratio = width / height
            ai_common_ratios = [1.0, 1.5, 0.67, 2.0, 0.5]  # 1:1, 3:2, 2:3, 2:1, 1:2
            
            for ratio in ai_common_ratios:
                if abs(aspect_ratio - ratio) < 0.1:
                    flags.append(f'ai_common_aspect_ratio_{ratio}')
                    break
            
            return {
                'indicates_ai': indicates_ai,
                'flags': flags,
                'color_analysis': {
                    'mean_colors': mean_colors.tolist(),
                    'std_colors': std_colors.tolist()
                }
            }
            
        except ImportError:
            return {'indicates_ai': False, 'flags': ['numpy_unavailable']}
        except Exception:
            return {'indicates_ai': False, 'flags': []}
    
    def _analyze_image_statistics(self, image) -> Dict:
        """Analyze statistical properties of the image."""
        flags = []
        indicates_ai = False
        
        # Check image dimensions
        width, height = image.size
        
        # AI images often have specific dimension patterns
        common_ai_sizes = [
            (512, 512), (1024, 1024), (768, 768),  # Square AI formats
            (512, 768), (768, 512),                 # Portrait/landscape AI
            (1024, 768), (768, 1024)               # Higher res AI
        ]
        
        for ai_width, ai_height in common_ai_sizes:
            if (width, height) == (ai_width, ai_height):
                flags.append(f'ai_standard_size_{width}x{height}')
                indicates_ai = True
                break
        
        return {
            'indicates_ai': indicates_ai,
            'flags': flags,
            'dimensions': [width, height]
        }
    
    def _analyze_compression_artifacts(self, image_data: bytes) -> Dict:
        """Analyze compression artifacts that might indicate AI generation."""
        flags = []
        indicates_ai = False
        
        # Check file size vs dimensions heuristics
        file_size = len(image_data)
        
        # AI images often have specific compression characteristics
        if file_size < 100000:  # Less than 100KB
            flags.append('low_file_size')
        elif file_size > 5000000:  # More than 5MB
            flags.append('high_file_size')
            
        # Very clean compression often indicates AI generation
        if 50000 < file_size < 200000:
            flags.append('ai_typical_compression')
            indicates_ai = True
        
        return {
            'indicates_ai': indicates_ai,
            'flags': flags,
            'file_size': file_size
        }
    
    def _extract_text_from_html(self, html_content: str) -> str:
        """Extract readable text from HTML content."""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text
            text = soup.get_text()
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text
            
        except ImportError:
            # Simple regex-based extraction if BeautifulSoup not available
            text = re.sub(r'<[^>]+>', '', html_content)
            text = re.sub(r'\s+', ' ', text).strip()
            return text
        except Exception:
            return html_content[:1000]  # Fallback to raw HTML
    
    def _analyze_url_patterns(self, url: str, html_content: str) -> Dict:
        """Analyze URL and HTML patterns for AI content indicators."""
        flags = []
        indicates_ai = False
        
        # Check domain patterns
        domain = urlparse(url).netloc.lower()
        ai_domains = [
            'openai.com', 'midjourney.com', 'stability.ai', 'runwayml.com',
            'leonardo.ai', 'nightcafe.studio', 'artbreeder.com'
        ]
        
        for ai_domain in ai_domains:
            if ai_domain in domain:
                flags.append(f'ai_platform_domain_{ai_domain.replace(".", "_")}')
                indicates_ai = True
        
        # Check for AI-related keywords in HTML
        ai_keywords = [
            'generated by ai', 'artificial intelligence', 'machine learning',
            'neural network', 'deep learning', 'ai-generated', 'synthetic media'
        ]
        
        html_lower = html_content.lower()
        for keyword in ai_keywords:
            if keyword in html_lower:
                flags.append(f'ai_keyword_{keyword.replace(" ", "_")}')
                indicates_ai = True
        
        return {
            'indicates_ai': indicates_ai,
            'flags': flags
        }
    
    def _generate_image_explanation(self, result: Dict) -> str:
        """Generate explanation for image AI detection."""
        if result['ai_probability'] < 0.3:
            return "Image appears to be authentic with natural photographic characteristics."
        elif result['ai_probability'] < 0.7:
            return f"Image shows some AI generation indicators: {', '.join(result['detection_methods'])}. Requires further verification."
        else:
            return f"High probability of AI generation detected via: {', '.join(result['detection_methods'])}."
    
    def _generate_video_explanation(self, result: Dict) -> str:
        """Generate explanation for video AI detection."""
        if result['ai_probability'] < 0.3:
            return "Video appears to be authentic recording."
        elif result['ai_probability'] < 0.7:
            return f"Video shows some AI generation indicators: {', '.join(result['detection_methods'])}."
        else:
            return f"High probability of AI-generated video: {', '.join(result['detection_methods'])}."


# Global detector instance
media_detector = MediaAIDetector()


def analyze_media_content(content_type: str, data, **kwargs) -> Dict:
    """Main function to analyze different types of media for AI generation."""
    if content_type == 'image':
        return media_detector.analyze_image(data, kwargs.get('filename'))
    elif content_type == 'video':
        return media_detector.analyze_video(data)
    elif content_type == 'url':
        return media_detector.analyze_url(data)
    else:
        return {
            'error': f'Unsupported content type: {content_type}',
            'ai_probability': 0.0,
            'confidence': 0.0
        }