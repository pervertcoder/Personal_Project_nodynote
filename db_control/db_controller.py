from db_control.db_pool import get_db_connect
import json

# 寫入會員資料
def write_data(user_name:str, use_email:str, user_password:str):
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
def get_member_data(email:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member where email = %s"
    mycursor.execute(sql, (email,))
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

# 使用者資料
def get_member_name(user_id:int):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select * from member where id = %s"
    mycursor.execute(sql, (user_id,))
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

# 新增筆記
def put_note_name(user_id:str, note_title:str, note_content:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    try:
        conn.start_transaction()
        lines = note_content.split("\n")
        content_list = [{"text" : line, "version" : 0} for line in lines]
        content_str = json.dumps(content_list)
        sql = "insert into notes (title, content) values (%s, %s)"
        param = (note_title, content_str)
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

# 檢查權限+拿取筆記內容
def check_permission(note_id:str, user_id:int):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select notes.title, notes.content, note_permissions.role from notes join note_permissions on notes.id = note_permissions.note_id  where notes.id = %s and note_permissions.user_id = %s;"
    param = (note_id, user_id)
    mycursor.execute(sql, param)
    result = [x for x in mycursor]
    mycursor.close()
    conn.close()
    return result

# websocket初始化拿取筆記內容資料
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

# 每30秒驗證
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

# websocket更新DB
def update_note_websocket(note_title:str, note_content:list, note_id:int):
    content_str = json.dumps(note_content)
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "update notes n join note_permissions p on n.id = p.note_id set n.title = %s, n.content = %s where n.id = %s"
    param = (note_title, content_str, note_id)
    mycursor.execute(sql, param)
    conn.commit()
    mycursor.close()
    conn.close()
    print("data updated successfully")
    return mycursor.rowcount

# 更新筆記資料
def update_note(note_title:str, note_content:str, note_id:str, user_id:int):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "update notes n join note_permissions p on n.id = p.note_id set n.title = %s, n.content = %s where n.id = %s and p.user_id = %s and p.role in ('owner', 'editor')"
    param = (note_title, note_content, note_id, user_id)
    mycursor.execute(sql, param)
    conn.commit()
    mycursor.close()
    conn.close()
    print("data updated successfully")
    return mycursor.rowcount

# 筆記列表資料
def render_note_data(user_id:int, role:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select n.id, n.title from notes n join note_permissions p on n.id = p.note_id where p.user_id = %s and p.role = %s order by n.id ASC"
    param = (user_id, role)
    mycursor.execute(sql, param)
    notes = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return notes

# 刪除筆記資料
def delete_note(note_id:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "delete from notes where id = %s"
    param = (note_id,)
    mycursor.execute(sql, param)
    conn.commit()
    mycursor.close()
    conn.close()
    print("data deleted successfully")

# 驗證role
def check_role(note_id:str, user_id:int):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select role from note_permissions where note_id = %s and user_id = %s"
    param = (note_id, user_id)
    mycursor.execute(sql, param)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return result[0][0]

# 確認分享者存在
def check_shared_user(email:str):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "select id from member where email = %s"
    param = (email,)
    mycursor.execute(sql, param)
    result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    return result[0][0]

# 新增權限
def add_permission(note_id:str, user_id:int):
    conn = get_db_connect()
    mycursor = conn.cursor()
    sql = "insert into note_permissions (note_id, user_id, role) values (%s, %s, 'editor')"
    param = (note_id, user_id)
    mycursor.execute(sql, param)
    conn.commit()
    # result = mycursor.fetchall()
    mycursor.close()
    conn.close()
    print("permission updated")