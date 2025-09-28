@echo off
echo Starting Mann-Mitra Voice Agent Integration...
echo.

echo [1/3] Starting Buddy Agent (FastAPI - Port 8000)...
start "Buddy Agent" cmd /k "cd /d buddy && python main.py"

timeout /t 3 /nobreak

echo [2/3] Starting Main Server (Node.js - Port 5000)...
start "Main Server" cmd /k "cd /d server && npm run dev"

timeout /t 3 /nobreak

echo [3/3] Starting Frontend (React - Port 5173)...
start "Frontend" cmd /k "cd /d client\client && npm run dev"

echo.
echo All services started! Check the opened terminal windows.
echo.
echo Services:
echo - Buddy Agent: http://localhost:8000
echo - Main Server: http://localhost:5000  
echo - Frontend: http://localhost:5173
echo.
echo Open your browser to http://localhost:5173 to test the voice agent integration.
pause