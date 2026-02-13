from db_pool import get_db_connect

# 寫入會員資料
def write_data(user_name, use_email, user_password):
		conn = get_db_connect()
		mycursor = conn.cursor()
		sql = "insert into member (username, email, password) values(%s, %s, %s)"
		parm = (user_name, use_email, user_password)
		mycursor.execute(sql, parm)
		conn.commit()
		mycursor.close()
		print("data inserted successfully")
		
# 資料對比
def get_member_data():
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member"
    mycursor.execute(sql)
    result = [x for x in mycursor]
    mycursor.close()
    return result