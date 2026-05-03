import sqlite3
from flask import g
import re

    # Email validation regex (basic validation, can be expanded if needed)
email_regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')



# ------ Basic ------ #
DATABASE_URI = "database.db"

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db

def disconnect():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None


# ------ 'user' Handeling ------ #
def create_user(data):
    try:
        get_db().execute("insert into user values(?,?,?,?,?,?,?);", [data['email'],data['password'],data['firstname'],data['familyname'],data['gender'],data['city'],data['country']])
        get_db().commit()
        return True
    except:
        return False

def changePassword(token,newPassword):
    email = get_user_email_by_token(token)
    try:
        get_db().execute("update user set password = ? where email = ?;", [newPassword,email[0]])
        get_db().commit()
        return True
    except:
        return False



# ------ 'login_user' Handeling ------ #
def create_login_user(email,token):
    try:
        if get_logged_in_user(email) is None:
            get_db().execute("insert into logged_in_user values(?,?);",[email,token])
            get_db().commit()
            print("ye has logged in")
            return True,False 
        else:
            get_db().execute("update logged_in_user set token = ? where email = ?;",[token,email])
            get_db().commit()
            print("ye has changed token now")
            return True,True
    except:
        return False,False

def get_logged_in_user(email):
    cursor = get_db().execute("select * from logged_in_user where email = ?;", [email])
    matches = cursor.fetchone()
    cursor.close()    
    return matches

def delete_logged_in_user(email):
    try:
        get_db().execute("delete from logged_in_user where email like ?", [email])
        get_db().commit()
        return True
    except:
        return False


# ------ 'messages' Handeling ------ #
def get_user_messages(email):
    cursor = get_db().execute("select emailsent,content from messages where email like ?;", [email])
    matches = cursor.fetchall()
    cursor.close()  
    return matches

def get_user_email_by_token(token):
    cursor = get_db().execute("select email from logged_in_user where token like ?;", [token])
    matches = cursor.fetchone()
    cursor.close()    
    return matches

def post_message(toEmail, fromEmail, message):
    try:
        get_db().execute("INSERT INTO messages(email, emailsent, content) VALUES(?,?,?);", [toEmail, fromEmail,message])
        get_db().commit()
        return True
    except:
        return False


# ------ Misc ------ #
# get user data
def get_user_data_by_email(email):    #Change name to:  get_user_data_by_email ???
    cursor = get_db().execute("select * from user where email = ?;", [email])
    matches = cursor.fetchone()
    cursor.close()    
    return matches

def get_user_data_by_token(token):
    email = get_user_email_by_token(token)
    email = email[0]
    return get_user_data_by_email(email)  
 
def getUserByEmail(email):      #TODO: remove? what is it used for?
    return True
    

# Validator functions
def validateOldPassword(token, oldpassword):
    data = get_user_data_by_token(token)
    oldpsw = data[1]
    if oldpsw != oldpassword:
        return False
    else:
        return True
    
def validateToken(token):
   email = get_user_email_by_token(token)
   if not email:
       return False
   else:
       return True

def validate_user(email,password):
    cursor = get_db().execute("select email,password from user where email like ?;", [email])
    user = cursor.fetchone()
    cursor.close()
    return user

def ValidEmail(email):
  # Check if the email is a valid format and does not contain spaces
    return re.fullmatch(email_regex, email)







    



