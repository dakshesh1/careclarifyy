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
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            dbname=os.getenv("DB_NAME", "careclarify"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "admin"),
        )
        return connection
    except Exception as exc:
        raise RuntimeError(
            "Failed to connect to PostgreSQL database. "
            "Check DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD."
        ) from exc
