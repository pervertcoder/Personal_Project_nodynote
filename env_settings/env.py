import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

DB_HOST_RDS = os.getenv("DB_HOST_RDS")
DB_USER_RDS = os.getenv("DB_USER_RDS")
DB_PASSWORD_RDS = os.getenv("DB_PASSWORD_RDS")
DB_PORT_RDS = os.getenv("DB_PORT_RDS")

SECRET_KEY = os.getenv('SECRET_KEY')

# PARTNER_KEY = os.getenv('PARTNER_KEY')

ALGORITHM = 'HS256'