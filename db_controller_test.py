from db_control.db_pool import get_db_connect

def get_member_data(email):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member where email = %s"
    mycursor.execute(sql, (email,))
    result = [x for x in mycursor]
    mycursor.close()
    return result

ans = get_member_data("test1@test.com")
# print(ans[0][3])

def get_member_name(user_id):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member where id = %s"
    mycursor.execute(sql, (user_id,))
    result = [x for x in mycursor]
    mycursor.close()
    return result

ans2 = get_member_name(1)
# print(ans2[0][1])