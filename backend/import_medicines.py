from pathlib import Path
import os
import re

import pandas as pd
import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import execute_values


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
TARGET_COLUMNS = [
    "brand_name",
    "generic_name",
    "manufacturer",
    "category",
    "description",
    "side_effects",
    "drug_interactions",
    "price",
]
COLUMN_ALIASES = {
    # Existing mappings
    "brand_name": "brand_name",
    "brand": "brand_name",
    "brandname": "brand_name",

    "generic_name": "generic_name",
    "generic": "generic_name",
    "genericname": "generic_name",

    "manufacturer": "manufacturer",
    "company": "manufacturer",
    "manufacturer_name": "manufacturer",

    "category": "category",
    "medicine_category": "category",

    "description": "description",
    "details": "description",

    "side_effects": "side_effects",
    "side_effect": "side_effects",
    "adverse_effects": "side_effects",

    "drug_interactions": "drug_interactions",
    "interactions": "drug_interactions",

    "price": "price",
    "cost": "price",
    "price_rs": "price",

    # ⭐ ADD THESE FOR YOUR CSV ⭐
    "product_name": "brand_name",
    "salt_composition": "generic_name",
    "product_manufactured": "manufacturer",
    "sub_category": "category",
    "medicine_desc": "description",
    "product_price": "price",
}



def sanitize_column_name(column_name: str) -> str:
    sanitized = re.sub(r"\s+", "_", str(column_name).strip())
    sanitized = re.sub(r"\W+", "_", sanitized)
    sanitized = sanitized.strip("_").lower()
    return sanitized or "column"


def get_csv_path() -> Path:
    candidates = [
        BASE_DIR / "backend" / "data" / "indian_medicine.csv",
        BASE_DIR / "data" / "indian_medicine.csv",
        Path.cwd() / "data" / "indian_medicine.csv",
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise FileNotFoundError(
        "CSV file not found. Expected one of: "
        f"{candidates[0]}, {candidates[1]}, or {candidates[2]}"
    )


def get_postgres_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "careclarify"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "admin"),
    )


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    normalized_columns = {col: sanitize_column_name(col) for col in df.columns}
    df = df.rename(columns=normalized_columns)

    rename_map = {}
    for column in list(df.columns):
        alias_target = COLUMN_ALIASES.get(column)
        if alias_target:
            rename_map[column] = alias_target

    df = df.rename(columns=rename_map)

    missing_columns = [column for column in TARGET_COLUMNS if column not in df.columns]
    if missing_columns:
        raise ValueError(
            "CSV is missing required columns: " + ", ".join(missing_columns)
        )

    return df[TARGET_COLUMNS]


def main():
    csv_path = get_csv_path()
    df = pd.read_csv(csv_path)

    print(df.columns.tolist())

    if df.empty:
        raise ValueError("The CSV file contains no rows to import.")

    df = normalize_columns(df)

    # Clean price column
    df["price"] = (
        df["price"]
        .astype(str)
        .str.replace("₹", "", regex=False)
        .str.replace(",", "", regex=False)
        .str.strip()
    )

    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    df = df.where(pd.notna(df), None)
    df = df.drop_duplicates(
        subset=["brand_name", "generic_name"],
        keep="first"
    )

    print("Connected to PostgreSQL")

    conn = None
    try:
        conn = get_postgres_connection()
        conn.autocommit = False

        print("Creating table...")

        with conn.cursor() as cur:

            cur.execute("""
            CREATE TABLE IF NOT EXISTS medicines (
                id SERIAL PRIMARY KEY,
                brand_name VARCHAR(255),
                generic_name TEXT,
                manufacturer VARCHAR(255),
                category VARCHAR(255),
                description TEXT,
                side_effects TEXT,
                drug_interactions TEXT,
                price DECIMAL(10,2)
            )
            """)

            cur.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS medicines_brand_generic_uq
            ON medicines (brand_name, generic_name)
            """)

            print("Importing medicines...")

            rows = [tuple(row) for row in df.itertuples(index=False, name=None)]

            execute_values(
                cur,
                """
                INSERT INTO medicines (
                    brand_name,
                    generic_name,
                    manufacturer,
                    category,
                    description,
                    side_effects,
                    drug_interactions,
                    price
                )
                VALUES %s
                ON CONFLICT (brand_name, generic_name) DO NOTHING
                """,
                rows,
            )

            imported_count = cur.rowcount

        conn.commit()

        print(f"Imported {imported_count} medicines successfully.")

    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()
