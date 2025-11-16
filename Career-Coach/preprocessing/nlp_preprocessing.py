"""
NLP Preprocessing Module
Handles tokenization, lemmatization, and stopword removal
"""
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

# Download required NLTK data
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')

class NLPPipeline:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))

    def preprocess_text(self, text):
        """
        Process text through tokenization, lemmatization, and stopword removal
        """
        # Tokenization
        tokens = word_tokenize(text.lower())
        
        # Lemmatization and stopword removal
        processed_tokens = [
            self.lemmatizer.lemmatize(token) 
            for token in tokens 
            if token.isalnum() and token not in self.stop_words
        ]
        
        return ' '.join(processed_tokens)
