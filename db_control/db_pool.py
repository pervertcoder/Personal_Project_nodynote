from mysql.connector import pooling
from env_settings.env import DB_HOST, DB_USER, DB_PASSWORD, DB_HOST_RDS, DB_PASSWORD_RDS, DB_USER_RDS

pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=30,
    pool_reset_session=True,
    host = DB_HOST,
    user = DB_USER,
    password = DB_PASSWORD,
    database="nodynote"
)

def get_db_connect():
    return pool.get_connection()