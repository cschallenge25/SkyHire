import pandas as pd
import logging
from typing import Optional, Dict, Any
import re

logger = logging.getLogger(__name__)

class DataCleaner:
    def __init__(self):
        self.required_columns = [
            'job_id', 'title', 'company', 'description', 
            'required_skills', 'location', 'experience_level'
        ]
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text data."""
        if not isinstance(text, str):
            return ""

        text = ' '.join(text.split())
        # Remove special characters except basic punctuation
        text = re.sub(r'[^\w\s.,!?-]', ' ', text)
        return text.strip()
    
    def clean_skills(self, skills: str) -> list:
        """Convert skills string to a cleaned list of skills."""
        if not isinstance(skills, str):
            return []
        
        # Split by common delimiters and clean each skill
        delimiters = [',', ';', '|', '/']
        for delim in delimiters[1:]:
            skills = skills.replace(delim, delimiters[0])
        
        skills_list = [self.clean_text(skill) for skill in skills.split(delimiters[0])]
        return [skill for skill in skills_list if skill]
    
    def clean_job_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean the job listings dataframe."""
        try:
            # Check required columns
            missing_columns = [col for col in self.required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
            
            # Clean text fields
            text_columns = ['title', 'company', 'description']
            for col in text_columns:
                df[col] = df[col].apply(self.clean_text)
            
            # Clean skills
            if 'required_skills' in df.columns:
                df['cleaned_skills'] = df['required_skills'].apply(self.clean_skills)
            
            # Handle missing values
            df = df.dropna(subset=['job_id', 'title', 'description'])
            
            # Reset index after dropping rows
            return df.reset_index(drop=True)
            
        except Exception as e:
            logger.error(f"Error cleaning job data: {str(e)}")
            raise

    def save_cleaned_data(self, df: pd.DataFrame, output_path: str) -> None:
        """Save cleaned data to file."""
        try:
            df.to_csv(output_path, index=False, encoding='utf-8')
            logger.info(f"Successfully saved cleaned data to {output_path}")
        except Exception as e:
            logger.error(f"Error saving cleaned data: {str(e)}")
            raise
