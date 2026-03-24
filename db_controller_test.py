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

# ans = get_member_data("test1@test.com")
# print(ans[0])

def get_member_name(user_id):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member where id = %s"
    mycursor.execute(sql, (user_id,))
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

# ans2 = get_member_name(1)
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
    sql = "select notes.title, notes.content, note_permissions.role from notes join note_permissions on notes.id = note_permissions.note_id  where notes.id = %s and note_permissions.user_id = %s;"
    param = (note_id, user_id)
    mycursor.execute(sql, param)
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result[0]

# ans3 = check_permission(12, 1)
# print(ans3)

def render_note_data(user_id):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select n.id, n.title from notes n join note_permissions p on n.id = p.note_id where p.user_id = %s and p.role = 'owner' order by n.id ASC"
    param = (user_id,)
    mycursor.execute(sql, param)
    notes = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return notes

# ans4 = render_note_data(1)
# print(ans4)

def check_role(note_id, user_id):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select role from note_permissions where note_id = %s and user_id = %s"
    param = (note_id, user_id)
    mycursor.execute(sql, param)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return result[0][0]

# ans5 = check_role(1, 1)
# print(ans5)


def check_shared_user(email):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select id from member where email = %s"
    param = (email,)
    mycursor.execute(sql, param)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return result[0][0]

# ans6 = check_shared_user("test1@test.com")
# print(ans6)

def get_note_data(note_id:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select id, title, content from notes where id = %s"
    param = (note_id,)
    mycursor.execute(sql, param)
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

# ans7 = get_note_data(7)
# print(ans7)

def get_verifiy_thirty(note_id:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select user_id from note_permissions where note_id = %s"
    param = (note_id,)
    mycursor.execute(sql, param)
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

# ans8 = get_verifiy_thirty(1)
# print(ans8)

def check_token_DB(email:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select current_token from member where email = %s"
    param = (email,)
    mycursor.execute(sql, param)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return result[0]

# ans9 = check_token_DB("test1@test.com")
# print(ans9[0])

def token_insert(token:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    try:
        sql = "insert into member (current_token) values (%s)"
        param = (token,)
        mycursor.execute(sql, param)
        conn.commit()
        print("insert successfully")
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        mycursor.close()
        conn.close()

# 檢查權限
def check_if_editor_owner(note_id:int, user_id:int):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from note_permissions where note_id = %s and user_id = %s"
    param = (note_id, user_id)
    mycursor.execute(sql, param)
    result = [x for x in mycursor]
    ans = {"permission_id" : result[0][0], "permission_role" : result[0][3]}
    mycursor.close()
    conn.close()
    return ans

# ans10 = check_if_editor_owner(102, 2)
# print(ans10)

def delete_permissions(permission_id:int):
    conn = get_db_connect()
    mycursor = conn.cursor()
    try:
        sql = "delete from note_permissions where id = %s"
        param = (permission_id,)
        mycursor.execute(sql, param)
        conn.commit()
        print("delete successfully")
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        mycursor.close()
        conn.close()
# delete_permissions(119)

# 分享的筆記列表資料
def share_only_notes(user_id:int):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select n.id, n.title, p.role from notes n join note_permissions p on n.id = p.note_id where p.user_id = %s and p.role != 'owner' order by n.id ASC"
    param = (user_id,)
    mycursor.execute(sql, param)
    notes = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return notes

ans11 = share_only_notes(1);
print(ans11)