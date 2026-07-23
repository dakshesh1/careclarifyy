import os
import json
import traceback

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500","http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/")
def home():
    return {"message": "CareClarify API Running"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:

        image_bytes = await file.read()

        response = client.models.generate_content(
            model="gemini-3.6-flash",
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