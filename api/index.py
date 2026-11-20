'''Vercel serverless entry point for FastAPI using Mangum.
The file must be located under the `/api` directory because Vercel
expects Python serverless functions there.
'''

import sys, os
# Add the project root to the Python path so that the `app` package can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mangum import Mangum
from app.main import app as fastapi_app

# Vercel will invoke this handler
handler = Mangum(fastapi_app)

