#!/bin/bash

# Go Goal Database Setup Script
# This script sets up PostgreSQL database and user for the Go Goal application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if PostgreSQL is running
check_postgres() {
    if ! command -v psql >/dev/null 2>&1; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL first."
        echo ""
        echo "Installation instructions:"
        echo "  macOS: brew install postgresql"
        echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        echo "  CentOS/RHEL: sudo yum install postgresql postgresql-server"
        exit 1
    fi

    if ! pg_isready >/dev/null 2>&1; then
        print_error "PostgreSQL is not running. Please start PostgreSQL first."
        echo ""
        echo "Start PostgreSQL:"
        echo "  macOS (brew): brew services start postgresql"
        echo "  Ubuntu/Debian: sudo systemctl start postgresql"
        echo "  CentOS/RHEL: sudo systemctl start postgresql"
        exit 1
    fi

    print_success "PostgreSQL is running"
}

# Function to create database and user
setup_database() {
    local db_name="${1:-go_goal}"
    local db_user="${2:-go_goal_user}"
    local db_password="${3:-go_goal_password}"
    
    print_info "Setting up database: $db_name"
    print_info "Creating user: $db_user"
    
    # Check if we can connect as current user
    if psql -lqt | cut -d \| -f 1 | grep -qw template1; then
        # We can connect as current user
        PSQL_CMD="psql"
    elif sudo -u postgres psql -lqt >/dev/null 2>&1; then
        # We need to use postgres user
        PSQL_CMD="sudo -u postgres psql"
        print_info "Using postgres system user for database setup"
    else
        print_error "Cannot connect to PostgreSQL. Please check your PostgreSQL installation."
        exit 1
    fi
    
    # Create user if it doesn't exist
    print_info "Creating database user..."
    $PSQL_CMD -c "DO \$\$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$db_user') THEN
            CREATE USER $db_user WITH PASSWORD '$db_password';
        END IF;
    END \$\$;" || {
        print_error "Failed to create user. You may need to run this script with appropriate permissions."
        exit 1
    }
    
    # Create database if it doesn't exist
    print_info "Creating database..."
    $PSQL_CMD -c "SELECT 1 FROM pg_database WHERE datname = '$db_name'" | grep -q 1 || \
    $PSQL_CMD -c "CREATE DATABASE $db_name OWNER $db_user;" || {
        print_error "Failed to create database."
        exit 1
    }
    
    # Grant privileges
    print_info "Granting privileges..."
    $PSQL_CMD -c "GRANT ALL PRIVILEGES ON DATABASE $db_name TO $db_user;" || {
        print_error "Failed to grant privileges."
        exit 1
    }
    
    # Also grant privileges on the public schema
    $PSQL_CMD -d "$db_name" -c "GRANT ALL ON SCHEMA public TO $db_user;" || {
        print_warning "Could not grant schema privileges (this might be okay)"
    }
    
    print_success "Database setup completed!"
    
    # Test connection
    print_info "Testing database connection..."
    if PGPASSWORD="$db_password" psql -h localhost -U "$db_user" -d "$db_name" -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "Database connection test successful!"
    else
        print_warning "Database connection test failed. Please check manually."
    fi
    
    return 0
}

# Function to show database connection info
show_connection_info() {
    local db_name="${1:-go_goal}"
    local db_user="${2:-go_goal_user}"
    local db_password="${3:-go_goal_password}"
    
    echo ""
    print_success "Database Setup Complete!"
    echo ""
    echo "Database Details:"
    echo "  Database Name: $db_name"
    echo "  Username: $db_user"
    echo "  Password: $db_password"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo ""
    echo "Connection String:"
    echo "  export DATABASE_URL='postgres://$db_user:$db_password@localhost/$db_name?sslmode=disable'"
    echo ""
    echo "To use this database with Go Goal:"
    echo "  1. Run: export DATABASE_URL='postgres://$db_user:$db_password@localhost/$db_name?sslmode=disable'"
    echo "  2. Start the application: make dev or ./dev.sh start"
    echo ""
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --database DB_NAME    Database name (default: go_goal)"
    echo "  -u, --user USERNAME       Database user (default: go_goal_user)"
    echo "  -p, --password PASSWORD   Database password (default: go_goal_password)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Use defaults"
    echo "  $0 -d myapp -u myuser -p mypass      # Custom settings"
    echo "  $0 --database go_goal_dev            # Custom database name"
    echo ""
}

# Parse command line arguments
DB_NAME="go_goal"
DB_USER="go_goal_user"
DB_PASSWORD="go_goal_password"

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        -p|--password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "🗄️  Go Goal Database Setup"
    echo "=========================="
    echo ""
    
    check_postgres
    setup_database "$DB_NAME" "$DB_USER" "$DB_PASSWORD"
    show_connection_info "$DB_NAME" "$DB_USER" "$DB_PASSWORD"
}

# Run main function
main "$@"