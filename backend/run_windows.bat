@echo off
cd /d "%~dp0"
if not exist .venv (
  py -3 -m venv .venv
  if errorlevel 1 python -m venv .venv
)
call .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
if not exist .env copy .env.example .env
echo.
echo Edit .env and add SERPAPI_API_KEY before using Live mode.
echo Optional: add GEMINI_API_KEY for semantic claim analysis.
echo API docs: http://127.0.0.1:8000/docs
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
