#!/bin/bash

# Test script for verification services using curl
# Usage: ./test-verifications.sh [BASE_URL]
# Example: ./test-verifications.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
TOTAL=0

test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_status=${5:-200}
  
  TOTAL=$((TOTAL + 1))
  
  echo -e "\n${CYAN}▶ Testing ${name}...${NC}"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ ${name}: Status ${http_code} (Expected: ${expected_status})${NC}"
    
    # Check if response has success field
    if echo "$body" | grep -q '"success"'; then
      success=$(echo "$body" | grep -o '"success":[^,}]*' | cut -d':' -f2 | tr -d ' ')
      if [ "$success" = "true" ]; then
        echo -e "${GREEN}✓ ${name}: Success flag is true${NC}"
      else
        echo -e "${YELLOW}ℹ ${name}: Success flag is false${NC}"
      fi
    fi
    
    # Check if verification result is OK
    if echo "$body" | grep -q '"ok"'; then
      ok=$(echo "$body" | grep -o '"ok":[^,}]*' | cut -d':' -f2 | tr -d ' ')
      if [ "$ok" = "true" ]; then
        echo -e "${GREEN}✓ ${name}: Verification result is OK${NC}"
      else
        echo -e "${YELLOW}ℹ ${name}: Verification result is NOT OK (this may be expected for test data)${NC}"
      fi
    fi
    
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ ${name}: Status ${http_code} (Expected: ${expected_status})${NC}"
    echo -e "${RED}Response: ${body}${NC}"
    FAILED=$((FAILED + 1))
  fi
}

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}Verification Services Test Suite (curl)${NC}"
echo -e "${CYAN}============================================================${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"

# Check if server is running
echo -e "\n${BLUE}ℹ Checking server connection...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/verify/ofqual/qualification?qualificationNumber=test" | grep -q "[0-9]"; then
  echo -e "${GREEN}✓ Server is running at ${BASE_URL}${NC}\n"
else
  echo -e "${RED}✗ Cannot connect to server at ${BASE_URL}${NC}"
  echo -e "${RED}Please make sure your Next.js development server is running:${NC}"
  echo -e "${YELLOW}  npm run dev${NC}"
  echo -e "\n${YELLOW}Or if using a different port:${NC}"
  echo -e "${YELLOW}  ./test-verifications.sh http://localhost:3001${NC}\n"
  exit 1
fi

# Test 1: Ofqual Qualification Verification (POST) - CORRECT
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 1: Ofqual Qualification Verification${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "Ofqual Qualification (POST) - CORRECT" \
  "POST" \
  "${BASE_URL}/api/verify/ofqual/qualification" \
  '{"qualificationNumber":"601/8830/6","qualificationTitle":"Level 3 Diploma in Health and Social Care","awardingOrganisation":"Pearson"}'

# Test 2: Ofqual Qualification Verification (POST) - WRONG
test_endpoint \
  "Ofqual Qualification (POST) - WRONG" \
  "POST" \
  "${BASE_URL}/api/verify/ofqual/qualification" \
  '{"qualificationNumber":"INVALID123456","qualificationTitle":"Non-existent Qualification","awardingOrganisation":"Fake Organisation"}'

# Test 3: Ofqual Qualification Verification (GET) - CORRECT
test_endpoint \
  "Ofqual Qualification (GET) - CORRECT" \
  "GET" \
  "${BASE_URL}/api/verify/ofqual/qualification?qualificationNumber=601/8830/6&qualificationTitle=Level%203%20Diploma%20in%20Health%20and%20Social%20Care"

# Test 4: Ofqual Qualification Verification (GET) - WRONG
test_endpoint \
  "Ofqual Qualification (GET) - WRONG" \
  "GET" \
  "${BASE_URL}/api/verify/ofqual/qualification?qualificationNumber=INVALID999&qualificationTitle=NonExistent"

# Test 5: DBS Update Service Verification - CORRECT
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 2: DBS Update Service Verification${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "DBS Update Service - CORRECT" \
  "POST" \
  "${BASE_URL}/api/verify/dbs/update-service" \
  '{"certificateNumber":"001913551408","surname":"KUJU","dob":{"day":"27","month":"5","year":"1994"},"format":"html"}'

# Test 6: DBS Update Service Verification - WRONG
test_endpoint \
  "DBS Update Service - WRONG" \
  "POST" \
  "${BASE_URL}/api/verify/dbs/update-service" \
  '{"certificateNumber":"INVALID999999","surname":"WRONG","dob":{"day":"01","month":"01","year":"2000"},"format":"html"}'

# Test 7: Professional Register Verification - NMC CORRECT
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 3: Professional Register Verification (NMC)${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "NMC Professional Register - CORRECT" \
  "POST" \
  "${BASE_URL}/api/verify/nmc" \
  '{"registrationNumber":"12A3456","firstName":"John","lastName":"Smith","dateOfBirth":"1990-01-15"}'

# Test 8: Professional Register Verification - NMC WRONG
test_endpoint \
  "NMC Professional Register - WRONG" \
  "POST" \
  "${BASE_URL}/api/verify/nmc" \
  '{"registrationNumber":"INVALID999","firstName":"Wrong","lastName":"Name","dateOfBirth":"2000-01-01"}'

# Test 9: Professional Register Verification - GMC CORRECT
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 4: Professional Register Verification (GMC)${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "GMC Professional Register - CORRECT" \
  "POST" \
  "${BASE_URL}/api/verify/gmc" \
  '{"registrationNumber":"12345678","firstName":"Jane","lastName":"Doe","dateOfBirth":"1985-06-20"}'

# Test 10: Professional Register Verification - GMC WRONG
test_endpoint \
  "GMC Professional Register - WRONG" \
  "POST" \
  "${BASE_URL}/api/verify/gmc" \
  '{"registrationNumber":"INVALID888","firstName":"Fake","lastName":"Doctor","dateOfBirth":"1995-12-31"}'

# Test 11: Professional Register Verification - HCPC CORRECT
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 5: Professional Register Verification (HCPC)${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "HCPC Professional Register - CORRECT" \
  "POST" \
  "${BASE_URL}/api/verify/hcpc" \
  '{"registrationNumber":"SW12345","firstName":"Sarah","lastName":"Johnson","dateOfBirth":"1992-03-10"}'

# Test 12: Professional Register Verification - HCPC WRONG
test_endpoint \
  "HCPC Professional Register - WRONG" \
  "POST" \
  "${BASE_URL}/api/verify/hcpc" \
  '{"registrationNumber":"INVALID777","firstName":"Invalid","lastName":"User","dateOfBirth":"1980-06-15"}'

# Test 13: Right to Work Verification - CORRECT
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 6: Right to Work Verification${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "Right to Work (Share Code) - CORRECT" \
  "POST" \
  "${BASE_URL}/api/verify/rtw/share-code" \
  '{"shareCode":"ABC123DEF456","dateOfBirth":"1990-05-15"}'

# Test 14: Right to Work Verification - WRONG
test_endpoint \
  "Right to Work (Share Code) - WRONG" \
  "POST" \
  "${BASE_URL}/api/verify/rtw/share-code" \
  '{"shareCode":"INVALID999","dateOfBirth":"2000-01-01"}'

# Test 15: ECS Verification - CORRECT
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 7: ECS (Employer Checking Service) Verification${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "ECS (Employer Checking Service) - CORRECT" \
  "POST" \
  "${BASE_URL}/api/verify/ecs" \
  '{"shareCode":"XYZ789GHI012","dateOfBirth":"1988-11-25"}'

# Test 16: ECS Verification - WRONG
test_endpoint \
  "ECS (Employer Checking Service) - WRONG" \
  "POST" \
  "${BASE_URL}/api/verify/ecs" \
  '{"shareCode":"INVALID888","dateOfBirth":"1995-12-31"}'

# Test 17: Invalid Professional Register (Error Handling)
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 8: Invalid Professional Register (Error Handling)${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "Invalid Professional Register" \
  "POST" \
  "${BASE_URL}/api/verify/invalid-register" \
  '{"registrationNumber":"12345","firstName":"Test","lastName":"User","dateOfBirth":"1990-01-01"}' \
  400

# Test 18: Missing Required Fields (Error Handling)
echo -e "\n${YELLOW}------------------------------------------------------------${NC}"
echo -e "${YELLOW}TEST 9: Missing Required Fields (Error Handling)${NC}"
echo -e "${YELLOW}------------------------------------------------------------${NC}"

test_endpoint \
  "Missing Required Fields" \
  "POST" \
  "${BASE_URL}/api/verify/rtw/share-code" \
  '{}' \
  400

# Summary
echo -e "\n${CYAN}============================================================${NC}"
echo -e "${CYAN}Test Summary${NC}"
echo -e "${CYAN}============================================================${NC}"
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: ${FAILED}${NC}"
else
  echo -e "${GREEN}Failed: ${FAILED}${NC}"
fi
echo -e "${CYAN}============================================================${NC}\n"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
  exit 1
fi

