import os

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4jpassword")

RISK_THRESHOLD = float(os.getenv("RISK_THRESHOLD", "80"))
FANIN_MAX_W = float(os.getenv("FANIN_MAX_W", "50"))
AMOUNT_MAX_W = float(os.getenv("AMOUNT_MAX_W", "30"))
COMMUNITY_W   = float(os.getenv("COMMUNITY_W", "20"))

FANIN_WINDOW_HOURS = int(os.getenv("FANIN_WINDOW_HOURS", "24"))
AVG_WINDOW_DAYS    = int(os.getenv("AVG_WINDOW_DAYS", "7"))
