from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from tree_constructor import get_tree
from synt_frequancy_list import get_list
from machine_translation import TextTranslation
from pymongo.errors import DuplicateKeyError
import nltk
import json
import uuid
import os
import logging
from pymongo import MongoClient, ASCENDING

client = MongoClient("mongodb://localhost:27017/")
db = client["WordsDictionary"]
collection = db["words_collection"]
collection.create_index([("word", ASCENDING)], unique=True)

logging.basicConfig(
    level=logging.INFO,  # Set the log level
    # Set the log format
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("fastapi.log"),  # Log to a file
        logging.StreamHandler()  # Log to the console
    ]
)

logger = logging.getLogger(__name__)


# Load configuration
with open("./src/config.json", "r") as config_file:
    config = json.load(config_file)

# Download necessary NLTK data
nltk.download("stopwords")
nltk.download("punkt")
nltk.download('averaged_perceptron_tagger')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount static files
app.mount(
    "/static", StaticFiles(directory=os.getcwd().removesuffix('\\src') + '\\'), name="static"
)


@app.get("/", response_class=FileResponse)
async def read_index():
    response = FileResponse(os.getcwd().removesuffix(
        '\\src') + "\\static\\index.html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.post("/upload_file")
async def upload_file(file: UploadFile = File(...)):
    try:
        upload_folder = "files/"
        os.makedirs(upload_folder, exist_ok=True)
        filename = file.filename
        file_path = os.path.join(upload_folder, filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        return {"filename": filename}
    except Exception as e:
        return {"error": str(e)}


@app.get('/synt_tree')
async def get_synt_tree_data(text: str) -> JSONResponse:
    try:
        tree_info = get_tree(text)
        return JSONResponse(content=tree_info)
    except Exception as e:
        return {"error": str(e)}


@app.get("/data_list")
async def get_data_list(text: str, english: bool) -> JSONResponse:
    try:
        data_list = get_list(text, english=english)
        for entry in data_list:
            try:
                unique_id = str(uuid.uuid4())  # Generate a unique UUID
                entry["_id"] = unique_id
                collection.insert_one(entry)
            except DuplicateKeyError:
                pass
        return JSONResponse(content=data_list)
    except Exception as e:
        return {"error": str(e)}


@app.get("/translation")
async def get_translated_text(text: str) -> JSONResponse:
    try:
        # result = currentTranslator.translate_text(text)
        return JSONResponse(content={"result": text})
    except Exception as e:
        return {"result": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app",
                host=config["host"], port=config["port"], reload=True)
