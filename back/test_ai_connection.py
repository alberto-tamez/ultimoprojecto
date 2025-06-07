#!/usr/bin/env python3
"""
Pure functional script to test connection to the AI microservice.
Following functional programming principles with pure functions and immutability.
"""
import requests
import sys
from typing import Dict, Any, Tuple

# Pure configuration values
AI_MICROSERVICE_BASE_URL = "http://172.28.69.157:1337"
AI_PREDICT_ENDPOINT = f"{AI_MICROSERVICE_BASE_URL}/predict"

def test_connection(url: str) -> Tuple[bool, str]:
    """
    Pure function to test connection to a URL.
    
    Args:
        url: The URL to test
        
    Returns:
        Tuple containing success status and message
    """
    try:
        response = requests.get(url, timeout=5)
        return True, f"Connection successful! Status code: {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, f"Connection error: Cannot connect to {url}"
    except requests.exceptions.Timeout:
        return False, f"Timeout: Connection to {url} timed out"
    except Exception as e:
        return False, f"Error: {str(e)}"

def main() -> None:
    """Main function to run the tests"""
    print(f"Testing connection to AI microservice at {AI_MICROSERVICE_BASE_URL}")
    
    # Test base URL
    success, message = test_connection(AI_MICROSERVICE_BASE_URL)
    print(f"Base URL test: {message}")
    
    # Test predict endpoint
    if success:
        success, message = test_connection(AI_PREDICT_ENDPOINT)
        print(f"Predict endpoint test: {message}")
    
    # Exit with appropriate status code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
