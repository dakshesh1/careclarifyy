from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.database import get_db_connection


# Router for medicine comparison endpoints.
router = APIRouter()


# Compare a selected medicine against alternatives sharing the same generic name.
@router.get("/compare")
def compare_medicines(
    medicine_name: str = Query(..., min_length=1, description="Brand name to compare")
) -> dict[str, Any]:
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Step 1: find the selected medicine by brand_name.
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
            LIMIT 1
            """,
            (f"%{medicine_name}%",),
        )
        selected_row = cursor.fetchone()

        if selected_row is None:
            raise HTTPException(status_code=404, detail="Medicine not found")

        selected_medicine = {
            "brand_name": selected_row[0],
            "generic_name": selected_row[1],
            "manufacturer": selected_row[2],
            "category": selected_row[3],
            "description": selected_row[4],
            "side_effects": selected_row[5],
            "drug_interactions": selected_row[6],
            "price": float(selected_row[7]) if selected_row[7] is not None else None,
        }

        generic_name = selected_row[1]

        # Step 2: find all medicines with the same generic_name.
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
    WHERE generic_name ILIKE %s
    ORDER BY price ASC NULLS LAST
    """,
    (f"%{generic_name.split('(')[0].strip()}%",),
)
        
        alternative_rows = cursor.fetchall()

        alternatives = []
        cheapest = None
        cheapest_price = None

        for row in alternative_rows:
            if row[7] is None:
                continue

            alternative = {
                "brand_name": row[0],
                "generic_name": row[1],
                "manufacturer": row[2],
                "category": row[3],
                "description": row[4],
                "side_effects": row[5],
                "drug_interactions": row[6],
                "price": float(row[7]),
            }

            # Ignore the selected medicine itself.
            if alternative["brand_name"].lower() == selected_medicine["brand_name"].lower():
                continue

            alternatives.append(alternative)

            if cheapest_price is None or alternative["price"] < cheapest_price:
                cheapest_price = alternative["price"]
                cheapest = alternative

        selected_price = selected_medicine["price"]
        if selected_price is None:
            potential_savings = 0
        elif cheapest is not None:
            potential_savings = max(selected_price - cheapest_price, 0)
        else:
            potential_savings = 0

        return {
            "selected_medicine": selected_medicine,
            "alternatives": alternatives,
            "cheapest": cheapest,
            "potential_savings": potential_savings,
        }
    except HTTPException:
        raise
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(exc)}") from exc
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()
