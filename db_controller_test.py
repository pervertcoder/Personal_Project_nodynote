from db_control.db_pool import get_db_connect

def get_member_data(email):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member where email = %s"
    mycursor.execute(sql, (email,))
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
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
    conn.close()
    return result

ans2 = get_member_name(1)
# print(ans2[0][1])

def put_note_name(note_title, note_content):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "insert into notes (title, content) values (%s, %s)"
    param = (note_title, note_content)
    mycursor.execute(sql, param)
    result = [x for x in mycursor]
    conn.commit()
    mycursor.close()
    conn.close()
    print("data inserted successfully")

def check_permission(note_id, user_id):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select notes.title, notes.content from notes join note_permissions on notes.id = note_permissions.note_id  where notes.id = %s and note_permissions.user_id = %s;"
    param = (note_id, user_id)
    mycursor.execute(sql, param)
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

ans3 = check_permission(1, 1)
# print(ans3)