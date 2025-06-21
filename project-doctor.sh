#!/bin/bash
set -euo pipefail

# Enable recursive globbing so '**' patterns traverse directories
# Nullglob prevents unmatched globs from expanding to literal strings
shopt -s globstar nullglob

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}
======================================================
          FREE TOOLS HUB - COMPREHENSIVE DOCTOR        
======================================================${NC}"

has_python_code() {
    [ -d "src" ] || find . -name '*.py' | grep -q .
}

check_python() {
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}Python 3 required${NC}"
        exit 1
    fi
}

check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js required${NC}"
        exit 1
    fi
}

ensure_node_deps() {
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}Installing npm dependencies...${NC}"
        npm install
    fi
}

setup_env() {
    # Create/activate venv only if Python code exists
    if ! has_python_code; then
        return
    fi

    if [ ! -d "venv" ]; then
        echo -e "${BLUE}Creating virtual environment...${NC}"
        python3 -m venv venv
    fi
    
    # Cross-platform activation
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate || {
            echo -e "${RED}Failed to activate venv${NC}"
            exit 1
        }
    else
        source venv/bin/activate || {
            echo -e "${RED}Failed to activate venv${NC}"
            exit 1
        }
    fi
    
    # Install dependencies
    echo -e "${BLUE}Installing dependencies...${NC}"
    if ! pip install --upgrade pip setuptools wheel; then
        echo -e "${RED}Failed to upgrade core tools${NC}"
        exit 1
    fi
    
    if ! pip install -r requirements.txt; then
        echo -e "${RED}Dependency installation failed${NC}"
        exit 1
    fi
}

run_python_checks() {
    echo -e "\n${BLUE}========== CODE QUALITY ==========${NC}"
    echo -e "${YELLOW}Running Pylint...${NC}"
    pylint --output-format=colorized --ignore=venv . || true
    
    echo -e "\n${YELLOW}Flake8 checks...${NC}"
    flake8 . || true
    
    echo -e "\n${YELLOW}Type checking with mypy...${NC}"
    mypy . || true
    
    echo -e "\n${YELLOW}Security scan with Bandit...${NC}"
    bandit -r . || true
    
    echo -e "\n${YELLOW}Secret detection...${NC}"
    detect-secrets scan . || true
    
    echo -e "\n${BLUE}========== TESTING ==========${NC}"
    echo -e "${YELLOW}Running tests...${NC}"
    pytest --cov=src --cov-report=term-missing || true
    
    echo -e "\n${YELLOW}Performance benchmarks...${NC}"
    pytest --benchmark-only || true
    
    echo -e "\n${BLUE}========== MAINTENANCE ==========${NC}"
    echo -e "${YELLOW}Checking dependencies...${NC}"
    pipdeptree --warn silence || true
}

run_web_checks() {
  echo -e "\n${BLUE}========== WEB QUALITY ==========${NC}"
  echo -e "${YELLOW}HTML validation...${NC}"
  html_files=$(find . -path './vendor' -prune -o -name '*.html' -print)
  npx --no-install htmlhint ${html_files} || true

  echo -e "\n${YELLOW}CSS linting...${NC}"
  css_files=$(find . -path './vendor' -prune -o -name '*.css' -print)
  npx --no-install csslint ${css_files} || true
}

# Main execution
if has_python_code; then
    check_python
    setup_env
    run_python_checks
else
    echo -e "${YELLOW}No Python code detected. Skipping Python checks.${NC}"
    check_node
    ensure_node_deps
    run_web_checks
fi

echo -e "\n${GREEN}Checks completed. Review outputs for any warnings.${NC}"
