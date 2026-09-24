import pyTigerGraph as tg
from src.config import TG_HOST, TG_GRAPH, TG_USERNAME, TG_PASSWORD


conn = tg.TigerGraphConnection(
    host=TG_HOST,
    graphname=TG_GRAPH,
    username=TG_USERNAME,
    password=TG_PASSWORD,
    restppPort="9000",
    gsPort="14240",
)


def run_installed_query(name, **params):
    formatted_params = {}

    for key, value in params.items():
        if key == "cust":
            formatted_params[key] = (value,)
        else:
            formatted_params[key] = value

    return conn.runInstalledQuery(
        name,
        formatted_params,
        usePost=True
    )


def upsert_vertices(vtype, records: dict):
    """records: {vertex_id: {attr: value, ...}}"""
    vertices = list(records.items())
    return conn.upsertVertices(vtype, vertices)