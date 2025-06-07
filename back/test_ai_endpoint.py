#!/usr/bin/env python3
"""
Pure functional script to test the AI microservice analyze-csv endpoint.
Following functional programming principles with pure functions and immutability.
"""
import requests
import sys
from typing import Dict, Any, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Pure configuration values
AI_MICROSERVICE_BASE_URL = "http://172.28.69.157:1337"
AI_ANALYZE_CSV_ENDPOINT = f"{AI_MICROSERVICE_BASE_URL}/analyze-csv"

def test_endpoint(url: str) -> Tuple[bool, int, Optional[Dict[str, Any]]]:
    """
    Pure function to test an endpoint.
    
    Args:
        url: URL to test
        
    Returns:
        Tuple containing success status, status code, and response JSON (if available)
    """
    try:
        logger.info(f"Testing connection to {url}")
        response = requests.get(url, timeout=5)
        logger.info(f"Response status code: {response.status_code}")
        
        json_response = None
        try:
            json_response = response.json()
            logger.info(f"Response JSON: {json_response}")
        except Exception as e:
            logger.warning(f"Failed to parse JSON response: {str(e)}")
        
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
    print(f"Testing connection to AI microservice at {AI_MICROSERVICE_BASE_URL}")
    
    # Test base URL
    success, status_code, response = test_endpoint(AI_MICROSERVICE_BASE_URL)
    if success:
        print(f"✅ Base URL test successful (Status: {status_code})")
    else:
        print(f"❌ Base URL test failed")
    
    # Test analyze-csv endpoint
    success, status_code, response = test_endpoint(AI_ANALYZE_CSV_ENDPOINT)
    if success:
        print(f"✅ Analyze CSV endpoint test successful (Status: {status_code})")
    else:
        print(f"❌ Analyze CSV endpoint test failed (Status: {status_code})")
    
    # Exit with appropriate status code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
