import pandas as pd, os
os.makedirs("data/clean", exist_ok=True)

tx = pd.read_csv("data/transactions.csv", dtype={"customer_id": str, "TransactionID": str},
                 usecols=["TransactionID","customer_id","TransactionAmt","ts","channel",
                          "ProductCD","addr1","P_emaildomain","card6","risk_score"])
idn = pd.read_csv("data/identity.csv", dtype=str, usecols=["TransactionID","id_30","id_31"])
hist = pd.read_csv("data/closed_cases_history.csv", dtype=str)
cp = pd.read_csv("data/case_pack.csv", dtype=str)

# device = OS + browser, only when identity data exists
idn["device_id"] = (idn.id_30.fillna("") + " | " + idn.id_31.fillna("")).str.strip(" |")
idn.loc[idn.device_id == "", "device_id"] = None
tx = tx.merge(idn[["TransactionID","device_id"]].drop_duplicates("TransactionID"),
              on="TransactionID", how="left")

tx.rename(columns={"TransactionID":"txn_id","TransactionAmt":"amount","ProductCD":"product_cd",
                   "addr1":"region","P_emaildomain":"email_domain","card6":"card_type"}
          ).to_csv("data/clean/transactions.csv", index=False)

tx[["customer_id"]].drop_duplicates().to_csv("data/clean/customers.csv", index=False)
tx[["device_id"]].dropna().drop_duplicates().to_csv("data/clean/devices.csv", index=False)

# cards: every card id seen in history, case pack, and ring lists
ring = hist[["case_id","connected_card_ids"]].dropna()
ring = ring.assign(card_id=ring.connected_card_ids.str.split("|")).explode("card_id")
ring[["case_id","card_id"]].to_csv("data/clean/ring_link.csv", index=False)

cards = pd.concat([hist.card_id, cp.card_id, ring.card_id]).dropna().drop_duplicates().to_frame()
cards["customer_id"] = cards.card_id.str.split("-").str[0]
cards.to_csv("data/clean/cards.csv", index=False)

hist[["case_id","outcome","pattern","opened_at","closed_at","exposure_usd","analyst_notes"]] \
    .to_csv("data/clean/cases.csv", index=False)
hist[["case_id","customer_id","card_id"]].to_csv("data/clean/case_links.csv", index=False)

ct = hist[["case_id","txn_ids"]].dropna()
ct = ct.assign(txn_id=ct.txn_ids.str.split("|")).explode("txn_id")
ct[["case_id","txn_id"]].to_csv("data/clean/case_txn.csv", index=False)

print("done:", os.listdir("data/clean"))
print("transactions:", len(tx), "| customers:", tx.customer_id.nunique(), "| cards:", len(cards))