from mysql.connector import pooling
from env_settings.env import DB_HOST, DB_USER, DB_PASSWORD, DB_HOST_RDS, DB_PASSWORD_RDS, DB_USER_RDS, DB_PORT_RDS

pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=30,
    pool_reset_session=True,
    host = DB_HOST_RDS,
    user = DB_USER_RDS,
    password = DB_PASSWORD_RDS,
    port = DB_PORT_RDS,
    database="nodynote"
)

def get_db_connect():
    return pool.get_connection()