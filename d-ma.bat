@echo off

REM hs remove ihs-assets
call hs cms upload ihs-assets ihs-assets

call hs cms upload ihs-macros ihs-macros

REM hs remove ihs-settings
call hs cms upload ihs-settings ihs-settings

REM hs remove ihs-auth0
call hs cms upload ihs-auth0 ihs-auth0

call hs cms upload ihs-res ihs-res

echo.
echo All uploads completed.
