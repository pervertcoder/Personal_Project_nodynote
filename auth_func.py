import jwt
from datetime import datetime, timedelta, timezone
from env_settings.env import ALGORITHM, SECRET_KEY
from db_controller import write_data, get_member_data

class User:
	def __init__(self, user_name):
		self.user_name = user_name
		
    # 寫入資料
	def write_user_data(self, user_name, user_email, user_password):
		write_data(user_name, user_email, user_password)
		
    # 資料對比
	def get_user_data(self):
		result = get_member_data
		return result
	
# 會員驗證(有時間再做)
def create_jwt(data:dict)->str:
	payload = data.copy()
	expire_time = datetime.now(timezone.utc) + timedelta(hours=1)
	payload["exp"] = int((expire_time).timestamp())
	token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
	return token

def check_format(str_param:str) -> bool:
	search_at = str_param.index('@')
	search_com = str_param.index('.com')
	if search_at == -1 and search_com == -1:
		return False
	else:
		return True