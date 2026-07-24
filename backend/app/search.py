from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.database import get_db_connection


# Router for medicine search-related endpoints.
router = APIRouter()


# Search medicines by brand or generic name using a parameterized ILIKE query.
@router.get("/search")
def search_medicines(
    query: str = Query(..., min_length=1, description="Search text for medicine lookup")
) -> dict[str, Any]:
    search_term = f"%{query}%"

    # Use a database connection from the shared connection helper.
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Parameterized SQL keeps the query safe and avoids string interpolation issues.
        cursor.execute(
            """
            SELECT
                brand_name,
                generic_name,
                manufacturer,
                category,
                description,
                side_effects,
                drug_interactions,
                price
            FROM medicines
            WHERE brand_name ILIKE %s
               OR generic_name ILIKE %s
            LIMIT 20
            """,
            (search_term, search_term),
        )

        rows = cursor.fetchall()
        results = [
            {
                "brand_name": row[0],
                "generic_name": row[1],
                "manufacturer": row[2],
                "category": row[3],
                "description": row[4],
                "side_effects": row[5],
                "drug_interactions": row[6],
                "price": float(row[7]) if row[7] is not None else None,
            }
            for row in rows
        ]

        return {
            "count": len(results),
            "results": results,
        }
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        # Return a simple HTTP error response for any unexpected database or query failure.
        raise HTTPException(status_code=500, detail=f"Search failed: {str(exc)}") from exc
    finally:
        # Always ensure the cursor and database connection are closed.
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()
