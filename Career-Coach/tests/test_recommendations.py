"""
# Tests for the job recommendation system
"""
from flask import app
import pytest
from fastapi.testclient import TestClient
from api.routes.recommendations import router

client = TestClient(app)

def test_get_recommendations():
    """Test getting job recommendations"""
    test_data = {
        "user_id": "test_user_123",
        "job_title": "Software Engineer",
        "skills": ["Python", "Machine Learning", "Docker"],
        "experience_level": "mid",
        "location": "Remote",
        "max_results": 5
    }
    
    response = client.post("/api/recommendations", json=test_data)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= test_data["max_results"]
    
    if data:  # If there are results
        job = data[0]
        assert "job_id" in job
        assert "title" in job
        assert "company" in job
        assert "match_score" in job
        assert 0 <= job["match_score"] <= 1.0

def test_get_recommendations_missing_fields():
    """Test with missing required fields"""
    test_data = {
        "job_title": "Data Scientist"
    }
    
    response = client.post("/api/recommendations", json=test_data)
    assert response.status_code == 422  # Validation error

def test_get_recommendations_invalid_data():
    """Test with invalid data types"""
    test_data = {
        "user_id": 123,  # Should be string
        "job_title": "Data Scientist",
        "skills": "Python, R",  # Should be list
        "max_results": "five"  # Should be integer
    }
    
    response = client.post("/api/recommendations", json=test_data)
    assert response.status_code == 422  # Validation error

def test_get_recommendations_edge_cases():
    """Test edge cases for recommendations"""
    # Test with empty skills
    test_data = {
        "user_id": "test_user_123",
        "job_title": "Software Engineer",
        "skills": [],
        "max_results": 1
    }
    
    response = client.post("/api/recommendations", json=test_data)
    assert response.status_code == 200
    
    # Test with very specific job title
    test_data["job_title"] = "Senior Machine Learning Engineer with 5+ years experience"
    response = client.post("/api/recommendations", json=test_data)
    assert response.status_code == 200

def test_recommendation_quality():
    """Test that recommendations are relevant to the query"""
    test_data = {
        "user_id": "test_user_123",
        "job_title": "Data Scientist",
        "skills": ["Python", "Machine Learning", "SQL"],
        "max_results": 3
    }
    
    response = client.post("/api/recommendations", json=test_data)
    assert response.status_code == 200
    
    data = response.json()
    if data:
        # Check that at least one recommended job is relevant
        relevant_keywords = ["data", "scientist", "machine learning", "analytics"]
        job_titles = [job["title"].lower() for job in data]
        assert any(any(keyword in title for keyword in relevant_keywords) for title in job_titles)
