@echo off
cls
echo ========================================================
echo   LANZADOR DE IMPOSTAR - MODO LOCAL
echo ========================================================
echo.
echo 1. Asegurate de que tu PC y tu movil esten en la misma WiFi.
echo 2. Busca abajo tu "Direccion IPv4" (ejemplo: 192.168.1.35)
echo.
echo TU IP LOCAL ES:
ipconfig | findstr /i "ipv4"
echo.
echo 3. En tu movil, abre Chrome o Safari y escribe:
echo    http://<TU_IP_DE_ARRIBA>:8080
echo.
echo    Ejemplo: http://192.168.1.35:8080
echo.
echo ========================================================
echo Iniciando servidor... (Cierra esta ventana para detener)
echo ========================================================
call npx -y http-server . -a 0.0.0.0 -p 8080 -c-1
pause
