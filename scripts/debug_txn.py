import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pandas as pd
from src.tg_client import conn

tx = pd.read_csv("data/clean/transactions.csv", dtype=str)
row = tx[tx.txn_id == "3191314"].iloc[0]
print("Row from CSV:")
print(row.to_dict())

attrs = ["amount","ts","channel","product_cd","region","email_domain","card_type","risk_score"]
record = {a: row[a] for a in attrs if pd.notna(row[a])}
print("\nRecord being sent:")
print(record)

print("\nUpsert response:")
resp = conn.upsertVertices("Transaction", {"3191314": record})
print(resp)

print("\nReadback:")
print(conn.getVerticesById("Transaction", "3191314"))