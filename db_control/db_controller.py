from db_control.db_pool import get_db_connect

# 寫入會員資料
def write_data(user_name, use_email, user_password):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "insert into member (username, email, password) values(%s, %s, %s)"
    parm = (user_name, use_email, user_password)
    mycursor.execute(sql, parm)
    conn.commit()
    mycursor.close()
    conn.close()
    print("data inserted successfully")
# 資料對比
def get_member_data(email):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member where email = %s"
    mycursor.execute(sql, (email,))
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

# 使用者資料
def get_member_name(user_id):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member where id = %s"
    mycursor.execute(sql, (user_id,))
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

# 新增筆記
def put_note_name(user_id, note_title, note_content):
    conn = get_db_connect()
    mycursor = conn.cursor()
    try:
        conn.start_transaction()
        sql = "insert into notes (title, content) values (%s, %s)"
        param = (note_title, note_content)
        mycursor.execute(sql, param)
        note_id = mycursor.lastrowid
        sql2 = "insert into note_permissions (note_id, user_id, role) values (%s, %s, %s)"
        param2 = (note_id, user_id, "owner")
        mycursor.execute(sql2, param2)
        conn.commit()
        print("data inserted successfully")
        return note_id
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        mycursor.close()
        conn.close()

# 檢查權限
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

# 更新筆記資料
def update_note(note_title, note_content, id):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "update notes set title = %s, content = %s where id = %s"
    param = (note_title, note_content, id)
    mycursor.execute(sql, param)
    conn.commit()
    mycursor.close()
    conn.close()
    print("data updated successfully")