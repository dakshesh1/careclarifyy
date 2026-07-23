import os

import psycopg2
from dotenv import load_dotenv


# Load environment variables from the project .env file.
# This keeps connection details out of source control and supports local and deployed setups.
load_dotenv()


# Create and return a PostgreSQL connection object.
# The function is intentionally small and focused so it can be reused by routers and services.
def get_db_connection():
    try:
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
        )
        return connection
    except Exception as exc:
        raise RuntimeError("Failed to connect to PostgreSQL database.") from exc
