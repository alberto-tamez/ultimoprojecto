#!/usr/bin/env python3
"""
Pure functional script to explore available endpoints on the AI microservice.
Following functional programming principles with pure functions and immutability.
"""
import requests
import json
from typing import Dict, Any, List, Tuple, Optional

# Pure configuration values
AI_MICROSERVICE_BASE_URL = "http://172.28.69.157:1337"
COMMON_API_ENDPOINTS = [
    "/",
    "/predict",
    "/api",
    "/api/predict",
    "/api/v1/predict",
    "/analyze",
    "/api/analyze",
    "/csv",
    "/api/csv",
    "/upload",
    "/api/upload",
    "/process",
    "/api/process"
]

def test_endpoint(base_url: str, path: str) -> Tuple[int, Optional[Dict[str, Any]]]:
    """
    Pure function to test an endpoint.
    
    Args:
        base_url: Base URL of the service
        path: Path to test
        
    Returns:
        Tuple of status code and response JSON (if available)
    """
    url = f"{base_url}{path}"
    try:
        response = requests.get(url, timeout=5)
        json_response = None
        try:
            json_response = response.json()
        except:
            pass
        return response.status_code, json_response
    except Exception:
        return 0, None

def explore_endpoints(base_url: str, endpoints: List[str]) -> List[Dict[str, Any]]:
    """
    Pure function to explore multiple endpoints.
    
    Args:
        base_url: Base URL of the service
        endpoints: List of endpoints to test
        
    Returns:
        List of results with endpoint info
    """
    results = []
    for endpoint in endpoints:
        status_code, json_response = test_endpoint(base_url, endpoint)
        results.append({
            "endpoint": endpoint,
            "url": f"{base_url}{endpoint}",
            "status_code": status_code,
            "response": json_response
        })
    return results

def format_results(results: List[Dict[str, Any]]) -> str:
    """
    Pure function to format results as a readable string.
    
    Args:
        results: List of endpoint test results
        
    Returns:
        Formatted string representation
    """
    output = "AI Microservice Endpoint Exploration Results:\n"
    output += "=" * 50 + "\n\n"
    
    # Sort by status code (successful endpoints first)
    sorted_results = sorted(results, key=lambda x: (0 if 200 <= x["status_code"] < 300 else 1, x["endpoint"]))
    
    for result in sorted_results:
        output += f"Endpoint: {result['endpoint']}\n"
        output += f"URL: {result['url']}\n"
        output += f"Status Code: {result['status_code']}\n"
        
        if result["response"]:
            output += f"Response: {json.dumps(result['response'], indent=2)}\n"
        elif 200 <= result["status_code"] < 300:
            output += "Response: Success but no JSON response\n"
        elif result["status_code"] == 0:
            output += "Response: Connection error\n"
        else:
            output += f"Response: Error (HTTP {result['status_code']})\n"
            
        output += "-" * 50 + "\n\n"
    
    return output

def main() -> None:
    """Main function to run the exploration"""
    print(f"Exploring AI microservice endpoints at {AI_MICROSERVICE_BASE_URL}")
    results = explore_endpoints(AI_MICROSERVICE_BASE_URL, COMMON_API_ENDPOINTS)
    print(format_results(results))

if __name__ == "__main__":
    main()
