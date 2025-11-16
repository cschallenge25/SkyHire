import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Tuple
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import os

logger = logging.getLogger(__name__)

class JobSimilarity:
    def __init__(self, model_path: str = None):
        """
        Initialize the JobSimilarity model.
        
        Args:
            model_path: Path to save/load the trained model
        """
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), 'job_similarity_model.pkl')
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.job_vectors = None
        self.job_ids = []
        
    def fit(self, job_descriptions: List[str], job_ids: List[str] = None) -> None:
        """
        Fit the model on job descriptions.
        
        Args:
            job_descriptions: List of job description texts
            job_ids: Optional list of job IDs corresponding to descriptions
        """
        if not job_descriptions:
            raise ValueError("Job descriptions list cannot be empty")
            
        self.job_vectors = self.vectorizer.fit_transform(job_descriptions)
        self.job_ids = job_ids or [f"job_{i}" for i in range(len(job_descriptions))]
        
    def get_similar_jobs(self, 
                        query: str, 
                        top_n: int = 5, 
                        min_similarity: float = 0.5) -> List[Dict[str, Any]]:
        """
        Find similar jobs based on a query.
        
        Args:
            query: Text query (e.g., user skills or job description)
            top_n: Number of similar jobs to return
            min_similarity: Minimum similarity score (0-1)
            
        Returns:
            List of dictionaries containing job_id and similarity score
        """
        if self.job_vectors is None:
            raise ValueError("Model not fitted. Call fit() first.")
            
        # Transform query to same vector space
        query_vector = self.vectorizer.transform([query])
        
        # Calculate similarity scores
        similarities = cosine_similarity(query_vector, self.job_vectors).flatten()
        
        # Get top N matches
        top_indices = np.argsort(similarities)[::-1][:top_n]
        
        # Filter by minimum similarity and format results
        results = []
        for idx in top_indices:
            if similarities[idx] >= min_similarity:
                results.append({
                    'job_id': self.job_ids[idx],
                    'similarity_score': float(similarities[idx])
                })
                
        return results
    
    def save_model(self, path: str = None) -> None:
        """Save the model to disk."""
        save_path = path or self.model_path
        model_data = {
            'vectorizer': self.vectorizer,
            'job_vectors': self.job_vectors,
            'job_ids': self.job_ids
        }
        joblib.dump(model_data, save_path)
        logger.info(f"Model saved to {save_path}")
        
    @classmethod
    def load_model(cls, path: str) -> 'JobSimilarity':
        """Load a trained model from disk."""
        try:
            model_data = joblib.load(path)
            model = cls(model_path=path)
            model.vectorizer = model_data['vectorizer']
            model.job_vectors = model_data['job_vectors']
            model.job_ids = model_data['job_ids']
            return model
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise

    def calculate_skill_match(self, 
                            user_skills: List[str], 
                            job_skills: List[str]) -> Dict[str, Any]:
        """
        Calculate skill matching score between user skills and job required skills.
        
        Args:
            user_skills: List of user skills
            job_skills: List of required job skills
            
        Returns:
            Dictionary containing match score and matching skills
        """
        if not user_skills or not job_skills:
            return {
                'match_score': 0.0,
                'matching_skills': [],
                'missing_skills': job_skills if user_skills else []
            }
            
        # Convert to lowercase for case-insensitive comparison
        user_skills_lower = [skill.lower() for skill in user_skills]
        job_skills_lower = [skill.lower() for skill in job_skills]
        
        # Find matching skills
        matching_skills = list(set(user_skills_lower) & set(job_skills_lower))
        missing_skills = list(set(job_skills_lower) - set(user_skills_lower))
        
        # Calculate match score (percentage of required skills matched)
        match_score = len(matching_skills) / len(job_skills_lower) if job_skills_lower else 0.0
        
        return {
            'match_score': match_score,
            'matching_skills': matching_skills,
            'missing_skills': missing_skills
        }

# 🏋️ Entraîner le modèle
model = RandomForestClassifier()
model.fit(X_train, y_train)
accuracy = model.score(X_test, y_test)

# Sauvegarder
pickle.dump(model, open('job_match_model.pkl', 'wb'))