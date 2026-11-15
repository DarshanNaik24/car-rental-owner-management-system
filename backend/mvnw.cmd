@echo off
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Java\jdk-25.0.4" set JAVA_HOME=C:\Program Files\Java\jdk-25.0.4
    if exist "C:\Program Files\Java\latest" set JAVA_HOME=C:\Program Files\Java\latest
)

if exist "C:\Users\Dell\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd" (
    call "C:\Users\Dell\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

mvn %*
exit /b %ERRORLEVEL%
