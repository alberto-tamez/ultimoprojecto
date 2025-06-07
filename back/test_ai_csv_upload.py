#!/usr/bin/env python3
"""
Pure functional script to test the AI microservice analyze-csv endpoint with a file upload.
Following functional programming principles with pure functions and immutability.
"""
import requests
import sys
import os
from typing import Dict, Any, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Pure configuration values
AI_MICROSERVICE_BASE_URL = "http://172.28.69.157:1337"
AI_ANALYZE_CSV_ENDPOINT = f"{AI_MICROSERVICE_BASE_URL}/analyze-csv"
SAMPLE_CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                              "ai_microservice", "sample_data.csv")

def read_file(file_path: str) -> bytes:
    """
    Pure function to read a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        File contents as bytes
    """
    try:
        with open(file_path, 'rb') as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {str(e)}")
        raise

def test_csv_upload(url: str, file_path: str) -> Tuple[bool, int, Optional[Dict[str, Any]]]:
    """
    Pure function to test CSV upload to an endpoint.
    
    Args:
        url: URL to test
        file_path: Path to the CSV file
        
    Returns:
        Tuple containing success status, status code, and response JSON (if available)
    """
    try:
        logger.info(f"Testing CSV upload to {url} with file {file_path}")
        
        # Create the files dictionary for the request
        files = {'file': (os.path.basename(file_path), read_file(file_path), 'text/csv')}
        
        # Make the POST request with the file
        response = requests.post(url, files=files, timeout=10)
        logger.info(f"Response status code: {response.status_code}")
        
        json_response = None
        try:
            json_response = response.json()
            logger.info(f"Response JSON: {json_response}")
        except Exception as e:
            logger.warning(f"Failed to parse JSON response: {str(e)}")
            logger.info(f"Response text: {response.text[:500]}")
        
        return response.status_code < 400, response.status_code, json_response
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error: {str(e)}")
        return False, 0, None
    except requests.exceptions.Timeout as e:
        logger.error(f"Timeout error: {str(e)}")
        return False, 0, None
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False, 0, None

def main() -> None:
    """Main function to run the tests"""
    print(f"Testing CSV upload to AI microservice at {AI_ANALYZE_CSV_ENDPOINT}")
    
    # Check if sample CSV exists
    if not os.path.exists(SAMPLE_CSV_PATH):
        print(f"❌ Sample CSV file not found at {SAMPLE_CSV_PATH}")
        sys.exit(1)
    
    # Test CSV upload
    success, status_code, response = test_csv_upload(AI_ANALYZE_CSV_ENDPOINT, SAMPLE_CSV_PATH)
    if success:
        print(f"✅ CSV upload test successful (Status: {status_code})")
        print(f"Response: {response}")
    else:
        print(f"❌ CSV upload test failed (Status: {status_code})")
    
    # Exit with appropriate status code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
