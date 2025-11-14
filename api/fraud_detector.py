from neo4j_client import get_driver
from config import (FANIN_WINDOW_HOURS, AVG_WINDOW_DAYS,
                    FANIN_MAX_W, AMOUNT_MAX_W, COMMUNITY_W)

def _fan_in_last_hours(tx, dst_id: int, hours: int) -> int:
    q = """
    MATCH (dst:Account {id: $dst})<-[r:SENT]-()
    WHERE r.ts >= datetime() - duration({hours: $h})
    RETURN count(r) AS c
    """
    rec = tx.run(q, dst=dst_id, h=hours).single()
    return rec["c"] if rec and rec["c"] is not None else 0

def _avg_amount_for_src_days(tx, src_id: int, days: int) -> float:
    q = """
    MATCH (:Account {id: $src})-[r:SENT]->()
    WHERE r.ts >= datetime() - duration({days: $d})
    RETURN coalesce(avg(r.amount), 0.0) AS avgAmt
    """
    rec = tx.run(q, src=src_id, d=days).single()
    return float(rec["avgAmt"]) if rec and rec["avgAmt"] is not None else 0.0

def _community_flag(tx, acc_id):
    q = """
        MATCH (a:Account {id: $id})
        RETURN a.community IS NOT NULL AS hasCommunity
    """
    rec = tx.run(q, id=acc_id).single()
    return bool(rec and rec["hasCommunity"])
  
def score_transaction(src_account: int, dst_account: int, amount: float) -> dict:
    driver = get_driver()
    with driver.session() as session:
        fanin = session.execute_read(_fan_in_last_hours, dst_account, FANIN_WINDOW_HOURS)
        avg_src = session.execute_read(_avg_amount_for_src_days, src_account, AVG_WINDOW_DAYS)
        comm_flag = session.execute_read(_community_flag, dst_account)

    fanin_score = min(fanin / 20.0, 1.0) * FANIN_MAX_W
    if avg_src <= 0:
        amount_score = AMOUNT_MAX_W if amount > 2000 else (amount/2000.0)*AMOUNT_MAX_W
    else:
        ratio = amount / max(avg_src, 1e-6)
        amount_score = min(ratio / 5.0, 1.0) * AMOUNT_MAX_W

    community_score = COMMUNITY_W if comm_flag else 0.0
    total = fanin_score + amount_score + community_score
    risk = round(min(total, 100.0), 2)

    explanation = {
        f"fanin_last_{FANIN_WINDOW_HOURS}h": fanin,
        f"avg_src_last_{AVG_WINDOW_DAYS}d": round(avg_src, 2),
        "community_flag": comm_flag,
        "subscores": {
            "fanin": round(fanin_score,2),
            "amount": round(amount_score,2),
            "community": round(community_score,2)
        }
    }
    return {"risk": risk, "explanation": explanation}
