#!/bin/bash

# TitikTemu Docker Management Script
# Usage: ./docker-manage.sh [command]

set -e

COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="titiktemu"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Help message
show_help() {
    cat << EOF
TitikTemu Docker Management Script

Usage: ./docker-manage.sh [command] [options]

Commands:
  build               Build all Docker images
  up                  Start all services in background
  down                Stop all services
  logs                View logs from all services
  ps                  Show running services status
  clean               Stop and remove all containers, images, volumes
  reset               Full reset (clean + rebuild)
  health              Check health of all services
  shell [service]     Open shell in a service
  db                  Access PostgreSQL database

Options:
  -f, --follow        Follow logs in real-time
  -h, --help          Show this help message

Examples:
  ./docker-manage.sh build
  ./docker-manage.sh up
  ./docker-manage.sh logs -f
  ./docker-manage.sh shell gateway
  ./docker-manage.sh db

EOF
}

# Build images
build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker-compose -f $COMPOSE_FILE build
    echo -e "${GREEN}✓ Build complete${NC}"
}

# Start services
start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    docker-compose -f $COMPOSE_FILE up -d
    echo -e "${GREEN}✓ Services started${NC}"
    sleep 3
    show_status
}

# Stop services
stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    docker-compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# View logs
show_logs() {
    if [[ "$1" == "-f" ]] || [[ "$1" == "--follow" ]]; then
        docker-compose -f $COMPOSE_FILE logs -f
    else
        docker-compose -f $COMPOSE_FILE logs
    fi
}

# Show status
show_status() {
    echo -e "\n${YELLOW}Service Status:${NC}"
    docker-compose -f $COMPOSE_FILE ps
}

# Health check
check_health() {
    echo -e "${YELLOW}Checking service health...${NC}"
    
    services=("gateway:3000" "auth-service:3001" "event-service:3002" "attendance-service:3003" "venue-consumer-service:3004")
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if curl -s http://localhost:$port/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $name (port $port)"
        else
            echo -e "${RED}✗${NC} $name (port $port)"
        fi
    done
}

# Clean up
clean_all() {
    echo -e "${RED}⚠ Cleaning up all containers, images, and volumes...${NC}"
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy]es$ ]]; then
        docker-compose -f $COMPOSE_FILE down -v
        echo -e "${GREEN}✓ Cleanup complete${NC}"
    else
        echo "Cancelled"
    fi
}

# Full reset
full_reset() {
    echo -e "${RED}⚠ Performing full reset...${NC}"
    read -p "Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy]es$ ]]; then
        clean_all
        build_images
        start_services
        echo -e "${GREEN}✓ Reset complete${NC}"
    else
        echo "Cancelled"
    fi
}

# Open shell
open_shell() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Service name required${NC}"
        echo "Available services: gateway, auth-service, event-service, attendance-service, venue-consumer-service, postgres"
        exit 1
    fi
    
    case $1 in
        postgres|db)
            docker-compose -f $COMPOSE_FILE exec postgres psql -U titiktemu -d titiktemu_db
            ;;
        *)
            docker-compose -f $COMPOSE_FILE exec $1 sh
            ;;
    esac
}

# Access database
access_db() {
    docker-compose -f $COMPOSE_FILE exec postgres psql -U titiktemu -d titiktemu_db
}

# Main script logic
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    build)
        build_images
        ;;
    up)
        build_images
        start_services
        ;;
    down)
        stop_services
        ;;
    logs)
        show_logs "$2"
        ;;
    ps|status)
        show_status
        ;;
    health)
        check_health
        ;;
    clean)
        clean_all
        ;;
    reset)
        full_reset
        ;;
    shell)
        open_shell "$2"
        ;;
    db)
        access_db
        ;;
    help|-h|--help)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
