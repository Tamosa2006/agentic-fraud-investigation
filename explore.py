import pandas as pd

tx = pd.read_csv("data/transactions.csv",
                 usecols=["TransactionID", "customer_id", "card6", "ts"],
                 dtype={"customer_id": str})
hist = pd.read_csv("data/closed_cases_history.csv", dtype=str)

# real K number for each (customer, card6), taken from the history
h = hist[["card_id", "txn_ids"]].dropna().copy()
h["TransactionID"] = h.txn_ids.str.split("|")
h = h.explode("TransactionID")
h["TransactionID"] = h.TransactionID.astype(int)
m = h.merge(tx, on="TransactionID")
m["K"] = m.card_id.str.extract(r"-K(\d+)")[0].astype(int)
truth = m.drop_duplicates(["customer_id", "card6"])[["customer_id", "card6", "K"]]

# guess 1: K1 = card type the customer used first
first = tx.sort_values("ts").groupby(["customer_id", "card6"]).ts.min().reset_index()
first["guess_first"] = first.groupby("customer_id").ts.rank(method="first").astype(int)

# guess 2: K1 = card type the customer used most
cnt = tx.groupby(["customer_id", "card6"]).size().reset_index(name="n")
cnt["guess_most"] = cnt.groupby("customer_id").n.rank(method="first", ascending=False).astype(int)

r = truth.merge(first[["customer_id", "card6", "guess_first"]], on=["customer_id", "card6"])
r = r.merge(cnt[["customer_id", "card6", "guess_most"]], on=["customer_id", "card6"])

print("checked:", len(r))
print("first-used rule correct:", (r.K == r.guess_first).mean())
print("most-used rule correct:", (r.K == r.guess_most).mean())
print("customers with 2 card types:", (tx.groupby("customer_id").card6.nunique() == 2).sum())
print(r[r.K != r.guess_first].head(5).to_string())