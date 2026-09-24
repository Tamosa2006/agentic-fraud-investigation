import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
from src.tg_client import conn

def upsert_df(vtype, df, id_col, attrs=None, float_attrs=None):
    """Push a dataframe of vertices as (id, attrs) tuples.
    float_attrs: attribute names that must be sent as real floats, not strings."""
    attrs = attrs or []
    float_attrs = set(float_attrs or [])
    vertices = []
    for _, row in df.iterrows():
        vid = str(row[id_col])
        record = {}
        for a in attrs:
            val = row[a]
            if pd.isna(val):
                continue
            if a in float_attrs:
                try:
                    val = float(val)
                except ValueError:
                    continue
            record[a] = val
        vertices.append((vid, record))
    resp = 0
    if vertices:
        resp = conn.upsertVertices(vtype, vertices)
    print(f"  {vtype}: {len(vertices)} sent, response={resp}")

print("Loading customers...")
customers = pd.read_csv("data/clean/customers.csv", dtype=str)
upsert_df("Customer", customers, "customer_id")

print("Loading cards...")
cards = pd.read_csv("data/clean/cards.csv", dtype=str)
upsert_df("Card", cards, "card_id")

print("Loading devices...")
devices = pd.read_csv("data/clean/devices.csv", dtype=str)
upsert_df("Device", devices, "device_id")

print("Loading cases...")
cases = pd.read_csv("data/clean/cases.csv", dtype=str)
upsert_df("FraudCase", cases, "case_id",
          attrs=["outcome","pattern","opened_at","closed_at","exposure_usd","analyst_notes"],
          float_attrs=["exposure_usd"])

print("Loading transactions (this is the big one, ~590K rows)...")
tx = pd.read_csv("data/clean/transactions.csv", dtype=str)
tx_attrs = ["amount","ts","channel","product_cd","region","email_domain","card_type","risk_score"]
tx_float_attrs = {"amount", "risk_score"}
BATCH = 5000
vertices = []
count = 0
for _, row in tx.iterrows():
    vid = row["txn_id"]
    record = {}
    for a in tx_attrs:
        val = row[a]
        if pd.isna(val):
            continue
        if a in tx_float_attrs:
            try:
                val = float(val)
            except ValueError:
                continue
        record[a] = val
    vertices.append((vid, record))
    if len(vertices) >= BATCH:
        resp = conn.upsertVertices("Transaction", vertices)
        count += len(vertices)
        print(f"  ...{count} transactions upserted, resp={resp}")
        vertices = []
if vertices:
    resp = conn.upsertVertices("Transaction", vertices)
    count += len(vertices)
    print(f"  ...{count} transactions upserted, resp={resp}")
print(f"  Transaction: {count} sent total")

print("Loading edges...")

# customer -> card
edges = [(row["customer_id"], row["card_id"], {}) for _, row in cards.iterrows()]
resp = conn.upsertEdges("Customer", "owns_card", "Card", edges)
print(f"  owns_card: {len(edges)}, resp={resp}")

# customer -> transaction
edges = [(row["customer_id"], row["txn_id"], {}) for _, row in tx.iterrows() if pd.notna(row["customer_id"])]
BATCH = 5000
total = 0
for i in range(0, len(edges), BATCH):
    chunk = edges[i:i+BATCH]
    resp = conn.upsertEdges("Customer", "made_txn", "Transaction", chunk)
    total += len(chunk)
print(f"  made_txn: {total}")

# transaction -> device
tx_dev = tx.dropna(subset=["device_id"])
edges = [(row["txn_id"], row["device_id"], {}) for _, row in tx_dev.iterrows()]
resp = conn.upsertEdges("Transaction", "used_device", "Device", edges)
print(f"  used_device: {len(edges)}, resp={resp}")

# case -> customer, case -> card
case_links = pd.read_csv("data/clean/case_links.csv", dtype=str)
edges = [(row["case_id"], row["customer_id"], {}) for _, row in case_links.dropna(subset=["customer_id"]).iterrows()]
resp = conn.upsertEdges("FraudCase", "case_customer", "Customer", edges)
print(f"  case_customer: {len(edges)}, resp={resp}")

edges = [(row["case_id"], row["card_id"], {}) for _, row in case_links.dropna(subset=["card_id"]).iterrows()]
resp = conn.upsertEdges("FraudCase", "case_card", "Card", edges)
print(f"  case_card: {len(edges)}, resp={resp}")

# case -> transaction
case_txn = pd.read_csv("data/clean/case_txn.csv", dtype=str)
edges = [(row["case_id"], row["txn_id"], {}) for _, row in case_txn.iterrows()]
resp = conn.upsertEdges("FraudCase", "case_txn", "Transaction", edges)
print(f"  case_txn: {len(edges)}, resp={resp}")

# case -> ring cards
ring = pd.read_csv("data/clean/ring_link.csv", dtype=str)
edges = [(row["case_id"], row["card_id"], {}) for _, row in ring.iterrows()]
resp = conn.upsertEdges("FraudCase", "ring_link", "Card", edges)
print(f"  ring_link: {len(edges)}, resp={resp}")

print("\nDONE. Vertex counts:")
for v in ["Customer","Card","Transaction","Device","FraudCase"]:
    print(f"  {v}: {conn.getVertexCount(v)}")