from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()

@router.get("/account/{id}")
def graph_account(id: int):
    query = """
    MATCH (a:Account {id: $id})-[r:SENT]->(b)
    RETURN a, r, b LIMIT 100
    """

    with get_driver().session() as session:
        result = session.run(query, id=id)
        return result.data()
