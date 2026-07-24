from xml.etree.ElementTree import PI

from app.search import router as search_router
from app.compare import router as compare_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import traceback

from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from google import genai
from google.genai import types


# Application metadata for the FastAPI service.
APP_TITLE = "CareClarify API"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = (
    "This backend powers hospital bill analysis, prescription decoding, "
    "medicine comparison, and AI explanations."
)


# Create the FastAPI application instance.
# This keeps the entrypoint clean and makes it easy to later register routers
# with app.include_router(...).
app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
)


# Enable CORS for local development and testing.
# This configuration allows all origins, methods, headers, and credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(search_router)
app.include_router(compare_router)

# Root endpoint for basic service discovery.
@app.get("/")
def read_root() -> dict:
    return {
        "message": "Welcome to CareClarify API",
        "status": "running",
        "version": APP_VERSION,
    }


# Health check endpoint for deployment and monitoring.
@app.get("/health")
def health_check() -> dict:
    return {
        "status": "healthy",
        "database": "checking...",
    }
@app.get("/test")
def test():
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Say hello in one sentence."
        )
        return {"response": response.text}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "error": str(e),
            "type": type(e).__name__
        }



load_dotenv()
print("Gemini Key:", os.getenv("GEMINI_API_KEY"))


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

PROMPT = """
You are an expert medical billing analyst.

Analyze the uploaded hospital bill.

Return ONLY valid JSON.

Schema:

{
  "currencySymbol":"₹",
  "title":"Hospital Bill Analysis",
  "patient":"",
  "hospitalName":"",
  "date":"",
  "billNo":"",

  "totalOriginal":0,
  "totalFair":0,
  "overcharge":0,

  "items":[
    {
      "name":"",
      "original":0,
      "fair":0,
      "category":"",
      "status":"Reasonable",
      "reason":""
    }
  ],

  "warnings":[
    {
      "type":"danger",
      "title":"",
      "text":"",
      "action":""
    }
  ]
}

Rules:

- Status must ONLY be:
  - Reasonable
  - Overcharged
  - Needs Review

- Estimate fair prices using typical Indian private hospital pricing.

- If uncertain, use "Needs Review".

Return ONLY JSON.
"""



@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:

        image_bytes = await file.read()

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=PROMPT),
                        types.Part.from_bytes(
                            data=image_bytes, 
                            mime_type=file.content_type,
                ),
            ],
        )])

        print("\n========== GEMINI RAW RESPONSE ==========")
        print(response)
        print("=========================================\n")

        text = response.text

        print("\n========== RESPONSE TEXT ==========")
        print(text)
        print("===================================\n")

        if text is None:
            raise Exception("Gemini returned no text.")

        text = text.strip()

        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "")
            text = text.strip()

        data = json.loads(text)

        # Calculate totals ourselves
        total_original = sum(item.get("original", 0) for item in data.get("items", []))
        total_fair = sum(item.get("fair", 0) for item in data.get("items", []))

        data["currencySymbol"] = "₹"
        data["totalOriginal"] = total_original
        data["totalFair"] = total_fair
        data["overcharge"] = max(total_original - total_fair, 0)

        return data

    except Exception as e:

        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )
   