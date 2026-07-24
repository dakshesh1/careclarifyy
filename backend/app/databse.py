import os

import psycopg2
from dotenv import load_dotenv


# Load environment variables from the project .env file.
# This keeps credentials out of source control and supports local and deployed setups.
load_dotenv()


# Build the database connection using environment variables.
# These values are expected to be provided in the .env file.
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
