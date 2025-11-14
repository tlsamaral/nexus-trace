from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()

@router.get("/account/{id}")
def graph_account(id: int):
    q = """
    MATCH (a:Account {id: $id})-[r:SENT]->(b)
    RETURN a, r, b LIMIT 100
    """
    with get_driver().session() as session:
        res = session.run(q, id=id)
    return [row.data() for row in res]