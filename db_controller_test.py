from db_control.db_pool import get_db_connect

def get_member_data():
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member"
    mycursor.execute(sql)
    result = [x for x in mycursor]
    mycursor.close()
    return result

ans = get_member_data()
print(ans)