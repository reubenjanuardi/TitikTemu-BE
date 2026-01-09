@echo off
REM TitikTemu Docker Management Script for Windows
REM Usage: docker-manage.bat [command]

setlocal enabledelayedexpansion

set "COMPOSE_FILE=docker-compose.yml"
set "PROJECT_NAME=titiktemu"

REM Help message
if "%1%"=="" (
    call :show_help
    exit /b 0
)

REM Route commands
if "%1%"=="build" (
    call :build_images
) else if "%1%"=="up" (
    call :build_images
    call :start_services
) else if "%1%"=="down" (
    call :stop_services
) else if "%1%"=="logs" (
    call :show_logs %2%
) else if "%1%"=="ps" (
    call :show_status
) else if "%1%"=="status" (
    call :show_status
) else if "%1%"=="health" (
    call :check_health
) else if "%1%"=="clean" (
    call :clean_all
) else if "%1%"=="reset" (
    call :full_reset
) else if "%1%"=="shell" (
    call :open_shell %2%
) else if "%1%"=="db" (
    call :access_db
) else if "%1%"=="help" (
    call :show_help
) else if "%1%"=="-h" (
    call :show_help
) else if "%1%"=="--help" (
    call :show_help
) else (
    echo Unknown command: %1%
    call :show_help
    exit /b 1
)

exit /b 0

:show_help
echo.
echo TitikTemu Docker Management Script
echo.
echo Usage: docker-manage.bat [command] [options]
echo.
echo Commands:
echo   build               Build all Docker images
echo   up                  Start all services in background
echo   down                Stop all services
echo   logs                View logs from all services (add -f to follow)
echo   ps                  Show running services status
echo   health              Check health of all services
echo   shell [service]     Open shell in a service
echo   db                  Access PostgreSQL database
echo   clean               Stop and remove all containers and volumes
echo   reset               Full reset (clean + rebuild + start)
echo.
echo Examples:
echo   docker-manage.bat build
echo   docker-manage.bat up
echo   docker-manage.bat logs -f
echo   docker-manage.bat shell gateway
echo   docker-manage.bat db
echo.
goto :eof

:build_images
echo.
echo Building Docker images...
docker-compose -f %COMPOSE_FILE% build
if errorlevel 1 (
    echo Build failed!
    exit /b 1
)
echo Build complete
goto :eof

:start_services
echo.
echo Starting services...
docker-compose -f %COMPOSE_FILE% up -d
if errorlevel 1 (
    echo Failed to start services!
    exit /b 1
)
echo Services started
timeout /t 3 /nobreak > nul
call :show_status
goto :eof

:stop_services
echo.
echo Stopping services...
docker-compose -f %COMPOSE_FILE% down
if errorlevel 1 (
    echo Failed to stop services!
    exit /b 1
)
echo Services stopped
goto :eof

:show_logs
if "%1%"=="-f" (
    docker-compose -f %COMPOSE_FILE% logs -f
) else if "%1%"=="--follow" (
    docker-compose -f %COMPOSE_FILE% logs -f
) else (
    docker-compose -f %COMPOSE_FILE% logs
)
goto :eof

:show_status
echo.
echo Service Status:
docker-compose -f %COMPOSE_FILE% ps
goto :eof

:check_health
echo.
echo Checking service health...
echo.

setlocal enabledelayedexpansion

REM Gateway
curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo [X] Gateway (port 3000)
) else (
    echo [OK] Gateway (port 3000)
)

REM Auth Service
curl -s http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo [X] Auth Service (port 3001)
) else (
    echo [OK] Auth Service (port 3001)
)

REM Event Service
curl -s http://localhost:3002/health >nul 2>&1
if errorlevel 1 (
    echo [X] Event Service (port 3002)
) else (
    echo [OK] Event Service (port 3002)
)

REM Attendance Service
curl -s http://localhost:3003/health >nul 2>&1
if errorlevel 1 (
    echo [X] Attendance Service (port 3003)
) else (
    echo [OK] Attendance Service (port 3003)
)

REM Venue Consumer Service
curl -s http://localhost:3004/health >nul 2>&1
if errorlevel 1 (
    echo [X] Venue Consumer Service (port 3004)
) else (
    echo [OK] Venue Consumer Service (port 3004)
)

endlocal
goto :eof

:clean_all
echo.
setlocal
set /p confirm="This will remove all containers and volumes. Continue? (y/n): "
if /i "%confirm%"=="y" (
    echo Cleaning up...
    docker-compose -f %COMPOSE_FILE% down -v
    if errorlevel 1 (
        echo Cleanup failed!
        exit /b 1
    )
    echo Cleanup complete
) else (
    echo Cancelled
)
endlocal
goto :eof

:full_reset
echo.
setlocal
set /p confirm="This will reset everything. Continue? (y/n): "
if /i "%confirm%"=="y" (
    call :clean_all
    call :build_images
    call :start_services
    echo Reset complete
) else (
    echo Cancelled
)
endlocal
goto :eof

:open_shell
if "%1%"=="" (
    echo Error: Service name required
    echo Available services: gateway, auth-service, event-service, attendance-service, venue-consumer-service, postgres
    exit /b 1
)

if "%1%"=="postgres" (
    docker-compose -f %COMPOSE_FILE% exec postgres psql -U titiktemu -d titiktemu_db
) else if "%1%"=="db" (
    docker-compose -f %COMPOSE_FILE% exec postgres psql -U titiktemu -d titiktemu_db
) else (
    docker-compose -f %COMPOSE_FILE% exec %1% sh
)
goto :eof

:access_db
docker-compose -f %COMPOSE_FILE% exec postgres psql -U titiktemu -d titiktemu_db
goto :eof
