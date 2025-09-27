#!/bin/bash

# Load environment variables from .env file
# This script is sourced by other scripts to load environment variables

load_env() {
    local env_file="${1:-.env}"
    
    if [ -f "$env_file" ]; then
        echo "📋 Loading environment from $env_file"
        
        # Export variables from .env file
        while IFS= read -r line || [ -n "$line" ]; do
            # Skip empty lines and comments
            if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
                # Remove leading/trailing whitespace
                line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
                
                # Export the variable
                if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
                    export "$line"
                fi
            fi
        done < "$env_file"
        
        return 0
    else
        echo "⚠️  No $env_file file found"
        return 1
    fi
}

# Create .env from .env.example if it doesn't exist
create_env_if_missing() {
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        echo "📄 Creating .env file from .env.example"
        cp .env.example .env
        echo "✅ .env file created. You can edit it to customize your settings."
        return 0
    elif [ ! -f ".env" ]; then
        echo "⚠️  No .env or .env.example file found"
        return 1
    fi
    return 0
}

# Function to update or add environment variable in .env
update_env_var() {
    local key="$1"
    local value="$2"
    local env_file="${3:-.env}"
    
    if [ -f "$env_file" ]; then
        # Check if variable exists
        if grep -q "^${key}=" "$env_file"; then
            # Update existing variable
            if command -v sed >/dev/null 2>&1; then
                # Use sed to replace the line
                sed -i.bak "s|^${key}=.*|${key}=${value}|" "$env_file"
                rm -f "${env_file}.bak"
            else
                # Fallback method
                grep -v "^${key}=" "$env_file" > "${env_file}.tmp"
                echo "${key}=${value}" >> "${env_file}.tmp"
                mv "${env_file}.tmp" "$env_file"
            fi
            echo "✅ Updated ${key} in $env_file"
        else
            # Add new variable
            echo "${key}=${value}" >> "$env_file"
            echo "✅ Added ${key} to $env_file"
        fi
    else
        echo "❌ $env_file not found"
        return 1
    fi
}

# Show current environment variables
show_env() {
    echo "📊 Current Environment Variables:"
    echo "================================="
    echo "DATABASE_URL: ${DATABASE_URL:-<not set>}"
    echo "PORT: ${PORT:-<not set>}"
    echo "ENVIRONMENT: ${ENVIRONMENT:-<not set>}"
    echo "DEBUG: ${DEBUG:-<not set>}"
    echo "FRONTEND_PORT: ${FRONTEND_PORT:-<not set>}"
    echo "API_BASE_URL: ${API_BASE_URL:-<not set>}"
    echo ""
}