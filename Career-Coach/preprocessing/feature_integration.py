"""
Feature Integration Module
Combines NLP features with metadata for model training
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Union

class FeatureIntegrator:
    def __init__(self):
        self.feature_weights = {
            'title': 1.0,
            'description': 0.8,
            'skills': 1.2,
            'experience': 0.7,
            'location': 0.5
        }
    
    def combine_features(
        self, 
        nlp_features: Dict[str, List[float]],
        metadata: Dict[str, Union[str, int, float]]
    ) -> Dict[str, float]:
        """
        Combine NLP features with metadata using predefined weights
        """
        combined_features = {}
        
        # Add NLP features
        for feature, values in nlp_features.items():
            if feature in self.feature_weights:
                weight = self.feature_weights.get(feature, 1.0)
                combined_features.update({
                    f"{feature}_{i}": val * weight 
                    for i, val in enumerate(values)
                })
        
        # Add metadata features
        for key, value in metadata.items():
            if isinstance(value, (int, float)):
                combined_features[key] = value
        
        return combined_features
    
    def normalize_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Normalize feature values to [0, 1] range
        """
        if not features:
            return {}
            
        min_val = min(features.values())
        max_val = max(features.values())
        range_val = max_val - min_val if max_val > min_val else 1.0
        
        return {
            key: (val - min_val) / range_val
            for key, val in features.items()
        }
