"""Vercel Serverless entry point for FastAPI.
We expose the FastAPI app via Mangum, which works with AWS Lambda / Vercel.
"""

from mangum import Mangum
from app.main import app as fastapi_app

# The handler that Vercel will invoke
handler = Mangum(fastapi_app)
