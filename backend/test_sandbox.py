import requests
import json

def test_sandbox():
    # Test cases
    test_cases = [
        {
            "name": "Simple print",
            "code": "print('Hello, World!')",
            "expected_output": "Hello, World!\n"
        },
        {
            "name": "Basic calculation",
            "code": "print(2 + 2)",
            "expected_output": "4\n"
        },
        {
            "name": "Error handling",
            "code": "print(undefined_variable)",
            "expected_error": "NameError"
        }
    ]

    # Run each test case
    for test in test_cases:
        print(f"\nRunning test: {test['name']}")
        try:
            response = requests.post(
                "http://localhost:8000/execute",
                json={"code": test["code"], "timeout": 5}
            )
            result = response.json()
            
            print(f"Status code: {response.status_code}")
            print(f"Output: {result.get('stdout', '')}")
            print(f"Error: {result.get('stderr', '')}")
            
            if "expected_output" in test:
                assert result["stdout"] == test["expected_output"], f"Expected {test['expected_output']}, got {result['stdout']}"
            if "expected_error" in test:
                assert test["expected_error"] in result["stderr"], f"Expected error containing {test['expected_error']}, got {result['stderr']}"
                
        except Exception as e:
            print(f"Test failed with error: {str(e)}")

if __name__ == "__main__":
    test_sandbox() 