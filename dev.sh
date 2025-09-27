#!/bin/bash

# Go Goal Development Server Script
# This script starts both backend and frontend servers concurrently

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment functions
source ./load-env.sh

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
port_available() {
    ! lsof -i:$1 >/dev/null 2>&1
}

# Function to kill processes on specific ports
cleanup() {
    print_info "Cleaning up processes..."
    
    # Kill processes on port 8080 (backend)
    if ! port_available 8080; then
        print_info "Stopping backend server on port 8080..."
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    fi
    
    # Kill processes on port 3000 (frontend)
    if ! port_available 3000; then
        print_info "Stopping frontend server on port 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    fi
    
    print_success "Cleanup completed"
}

# Function to setup database automatically
setup_database_auto() {
    print_info "Checking database setup..."
    
    # Check if PostgreSQL is running
    if ! command_exists psql; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL first."
        print_info "Installation: brew install postgresql (macOS) or apt-get install postgresql (Ubuntu)"
        exit 1
    fi
    
    if ! pg_isready >/dev/null 2>&1; then
        print_warning "PostgreSQL is not running. Attempting to start..."
        
        # Try to start PostgreSQL
        if command_exists brew; then
            brew services start postgresql >/dev/null 2>&1 || true
        elif command_exists systemctl; then
            sudo systemctl start postgresql >/dev/null 2>&1 || true
        fi
        
        sleep 3
        
        if ! pg_isready >/dev/null 2>&1; then
            print_error "Could not start PostgreSQL. Please start it manually and try again."
            print_info "Start PostgreSQL: brew services start postgresql (macOS) or sudo systemctl start postgresql (Linux)"
            exit 1
        fi
    fi
    
    # Test database connection
    if [ -n "$DATABASE_URL" ]; then
        # Extract connection details for testing
        local test_result
        test_result=$(echo "$DATABASE_URL" | grep -o 'postgres://[^:]*:[^@]*@[^/]*\/[^?]*' || echo "")
        
        if [ -n "$test_result" ]; then
            # Try to connect
            if ! psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
                print_warning "Database connection failed. Setting up database..."
                
                # Extract database name and user from URL
                local db_user=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
                local db_name=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
                local db_pass=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
                
                if [ -n "$db_user" ] && [ -n "$db_name" ]; then
                    print_info "Creating database user: $db_user"
                    print_info "Creating database: $db_name"
                    
                    # Try to create user and database
                    if setup_db_user_and_database "$db_user" "$db_name" "$db_pass"; then
                        print_success "Database setup completed successfully!"
                    else
                        print_error "Automatic database setup failed. Please run './setup-db.sh' manually."
                        exit 1
                    fi
                else
                    print_error "Could not parse database URL. Please run './setup-db.sh' manually."
                    exit 1
                fi
            else
                print_success "Database connection successful!"
            fi
        fi
    else
        print_warning "DATABASE_URL not set. Setting up default database..."
        if setup_db_user_and_database "go_goal_user" "go_goal" "go_goal_password"; then
            update_env_var "DATABASE_URL" "postgres://go_goal_user:go_goal_password@localhost/go_goal?sslmode=disable"
            export DATABASE_URL="postgres://go_goal_user:go_goal_password@localhost/go_goal?sslmode=disable"
            print_success "Database setup completed and .env updated!"
        else
            print_error "Database setup failed. Please run './setup-db.sh' manually."
            exit 1
        fi
    fi
}

# Function to setup database user and database
setup_db_user_and_database() {
    local db_user="$1"
    local db_name="$2"
    local db_pass="$3"
    
    # Determine PostgreSQL connection method
    local psql_cmd
    if psql -lqt >/dev/null 2>&1; then
        psql_cmd="psql"
    elif sudo -u postgres psql -lqt >/dev/null 2>&1; then
        psql_cmd="sudo -u postgres psql"
    else
        return 1
    fi
    
    # Create user if it doesn't exist
    $psql_cmd -c "DO \$\$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$db_user') THEN
            CREATE USER $db_user WITH PASSWORD '$db_pass';
        END IF;
    END \$\$;" >/dev/null 2>&1 || return 1
    
    # Create database if it doesn't exist
    $psql_cmd -c "SELECT 1 FROM pg_database WHERE datname = '$db_name'" | grep -q 1 || \
    $psql_cmd -c "CREATE DATABASE $db_name OWNER $db_user;" >/dev/null 2>&1 || return 1
    
    # Grant privileges
    $psql_cmd -c "GRANT ALL PRIVILEGES ON DATABASE $db_name TO $db_user;" >/dev/null 2>&1 || return 1
    $psql_cmd -d "$db_name" -c "GRANT ALL ON SCHEMA public TO $db_user;" >/dev/null 2>&1 || true
    
    return 0
}

# Function to load environment
load_environment() {
    print_info "Loading environment configuration..."
    
    # Create .env from .env.example if needed
    create_env_if_missing
    
    # Load environment variables
    if load_env; then
        print_success "Environment loaded successfully"
    else
        print_warning "No .env file found, using defaults"
    fi
}

# Function to start backend
start_backend() {
    print_info "Starting Go backend server..."
    
    if ! command_exists go; then
        print_error "Go is not installed. Please install Go first."
        exit 1
    fi
    
    if ! port_available 8080; then
        print_warning "Port 8080 is already in use. Trying to free it..."
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Load environment
    load_environment
    
    # Setup database automatically
    setup_database_auto
    
    # Set default PORT if not set
    if [ -z "$PORT" ]; then
        export PORT="8080"
    fi
    
    print_success "Backend server starting on http://localhost:${PORT}"
    go run cmd/server/main.go &
    BACKEND_PID=$!
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend started successfully
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "Backend server started successfully (PID: $BACKEND_PID)"
    else
        print_error "Failed to start backend server"
        print_info "Check the logs above for error details"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_info "Starting frontend development server..."
    
    if ! command_exists python3; then
        print_error "Python3 is not installed. Please install Python3 first."
        exit 1
    fi
    
    if ! port_available 3000; then
        print_warning "Port 3000 is already in use. Trying to free it..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    cd "$(dirname "$0")/web"
    print_success "Frontend server starting on http://localhost:3000"
    python3 -m http.server 3000 &
    FRONTEND_PID=$!
    
    # Wait a moment for frontend to start
    sleep 2
    
    # Check if frontend started successfully
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_success "Frontend server started successfully (PID: $FRONTEND_PID)"
    else
        print_error "Failed to start frontend server"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  start     Start both backend and frontend servers (default)"
    echo "  backend   Start only the backend server"
    echo "  frontend  Start only the frontend server"
    echo "  setup     Setup database and environment (run this first!)"
    echo "  stop      Stop all running servers"
    echo "  restart   Stop and start all servers"
    echo "  status    Show status of servers"
    echo "  env       Show current environment variables"
    echo "  help      Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL  PostgreSQL connection string"
    echo "  PORT          Backend server port (default: 8080)"
    echo ""
    echo "Files:"
    echo "  .env          Environment configuration file"
    echo "  .env.example  Example environment file"
    echo ""
}

# Function to show server status
show_status() {
    print_info "Server Status:"
    echo ""
    
    if port_available 8080; then
        print_error "Backend server: NOT RUNNING (port 8080 available)"
    else
        print_success "Backend server: RUNNING on port 8080"
    fi
    
    if port_available 3000; then
        print_error "Frontend server: NOT RUNNING (port 3000 available)"
    else
        print_success "Frontend server: RUNNING on port 3000"
    fi
}

# Trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Main script logic
case "${1:-start}" in
    start)
        print_info "Starting Go Goal development servers..."
        echo ""
        print_info "This will start:"
        print_info "  🔙 Backend API server on http://localhost:8080"
        print_info "  🌐 Frontend dev server on http://localhost:3000"
        echo ""
        print_warning "Press Ctrl+C to stop both servers"
        echo ""
        
        start_backend
        start_frontend
        
        echo ""
        print_success "🚀 Go Goal is now running!"
        print_info "📊 Backend API: http://localhost:8080"
        print_info "🌐 Frontend App: http://localhost:3000"
        echo ""
        print_info "Watching for changes... Press Ctrl+C to stop"
        
        # Wait for both processes
        wait $BACKEND_PID $FRONTEND_PID
        ;;
        
    backend)
        print_info "Starting backend server only..."
        start_backend
        print_success "Backend server is running. Press Ctrl+C to stop"
        wait $BACKEND_PID
        ;;
        
    frontend)
        print_info "Starting frontend server only..."
        start_frontend
        print_success "Frontend server is running. Press Ctrl+C to stop"
        wait $FRONTEND_PID
        ;;
        
    setup)
        print_info "Setting up Go Goal environment..."
        echo ""
        
        # Load and create environment
        load_environment
        
        # Setup database
        setup_database_auto
        
        # Install dependencies
        print_info "Installing Go dependencies..."
        go mod tidy
        
        echo ""
        print_success "🎉 Setup completed successfully!"
        print_info "You can now run: ./dev.sh start"
        ;;
        
    stop)
        cleanup
        ;;
        
    restart)
        print_info "Restarting servers..."
        cleanup
        sleep 2
        start_backend
        start_frontend
        print_success "Servers restarted successfully"
        wait $BACKEND_PID $FRONTEND_PID
        ;;
        
    status)
        show_status
        ;;
        
    env)
        load_environment >/dev/null 2>&1
        show_env
        ;;
        
    help)
        show_usage
        ;;
        
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac