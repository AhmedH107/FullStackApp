from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_sock import Sock
import database_helper
from secrets import token_hex
from uuid import uuid4

app = Flask(__name__)
currSocks = {} 
reSignIn = False
sock = Sock(app)

@app.route("/",methods = ['GET'])
def root():
    return send_from_directory('static','client.html')

@sock.route('/echo')
def echo(ws):
    while True:
        data = ws.receive() #token?
        print(data) #data -> email ???
        #email = database_helper.get_user_by_token(data)
        #print(email[0])
        email = data
        if email in currSocks:
            try:
                currSocks[email].send('sign out')
            except Exception as e:
                print(f"Socket send sign out failed: {e}")
                del currSocks[email]
        currSocks[email] = ws
        print(currSocks) 
        print("hello?")



# ------ decorators/wraps & misc ------ #

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization']
            print(token)
        else:
            return jsonify({'success':False, 'message':'No Authorization token exist in header'}), 401
        if token == None:
            return jsonify({'success':False, 'message':'a (valid) token is missing'})      # Never called?
        if not database_helper.validateToken(token):
            return jsonify({'success':False, 'message':'Could not validate token'}), 409

        try:    # Get email from token
            curr_user = database_helper.get_user_email_by_token(token)[0]
            print(curr_user)
        except Exception as e:
            return jsonify({'success':False, 'message':'somthing went wrong with the token', 'data':e }), 500
        
        return f(curr_user, *args, **kwargs)
    return decorated_function

def removeOldSock(email):   #!!! Incoming from LAB3 !!! 
    if email in currSocks:
        target = currSocks[email]
        if target is not None:
            try:
                target.send('sign out') 
            except Exception as e:
                print(f"Failed to send sign out message, socket already closed(): {e}")

            del currSocks[email] 

            try:
                target.close()  # Close it only if still open
                print(f"Closed WebSocket for {email}")
            except Exception as e:
                print(f"Failed to close WebSocket, already closed: {e}")
    else:
        print("socket no exists somehow") 
    return True

# ------ URL Routing ------ #

@app.route("/sign_up",methods = ['POST'])
def save_user():
    data = request.get_json()
  
   
    required_fields = ["email", "password", "firstname", "familyname", "gender", "city", "country"] #Checks object sent is correct
    for field in required_fields:
        if field not in data or data[field] is None or data[field]=="" :
            return jsonify({'success':False,'message':'one field is missing or empty'})
        
    if not database_helper.ValidEmail(data['email']):
        return jsonify({'success':False,'message':'invalid email'}),400
    
    if database_helper.get_user_data_by_email(data["email"]):
        return jsonify({'success':False,'message':'email already in use'}),409
    
   
    if  database_helper.create_user(data):
        return jsonify({'success':True,'message':'new user created'}),201
    else:
        return jsonify({'success':False,'message':'signup failed'}),500


@app.route("/sign_out",methods = ['DELETE']) #TODO remove user from logged_in table         
@token_required 
def signOut(curr_user):
    if curr_user in currSocks:
        print("socket should close now")
        target = currSocks[curr_user]
        target.close()
        del currSocks[curr_user] 

    if database_helper.delete_logged_in_user(curr_user):
        return jsonify({'success':True,'message':'sign out success'}), 200
    else:
        return jsonify({'success':False,'message':'sign out failed'}), 500



@app.route("/sign_in",methods = ['POST']) #TODO HASH TOKEN AND PUT IT IN AUTHORIZED HEARDER
def signIn():
    data = request.get_json()

    if  'username' not in data or data['username'] is None:
        return jsonify({'success':False,'message':"No email given"})

    user = database_helper.validate_user(data["username"] ,data["password"])
    if user is None:
        return jsonify({'success':False,'message':"user doesn't exist"})
    elif user[1] != data["password"] :
        return jsonify({'success':False,'message':'password does not match'})
    else:
        token = str(uuid4())
        sucsess,deleteSock = database_helper.create_login_user(data["username"],token)
        if sucsess:
            if deleteSock:
               #print("should remove old sock")
                removeOldSock(data["username"])
    
            respons = jsonify({'success':True,'message':'sign in', 'data': token})
            respons.headers['Authorization'] =  token
            return respons,201
        else:
            return jsonify({'success':False,'message':'sign in failed somehow'})
 


@app.route("/change_password",methods = ['PUT'])
@token_required
def changePassword(curr_user):
    token = request.headers['Authorization']
    data = request.get_json()

    required_fields = ["newpassword", "oldpassword"] #Checks object sent is correct
    for field in required_fields:
        if field not in data or data[field] is None or data[field]=="" :
            return jsonify({'success':False,'message':'one field is missing or empty'})
    
    if not database_helper.validateOldPassword(token, data['oldpassword']):
        return jsonify({'success':False,'message':'Current password does not match'})
    
    if len(data['newpassword'])<5:
        return jsonify({'success':False,'message':'new password too short'})
    
    if database_helper.changePassword(token, data['newpassword']):
        return jsonify({'success':True,'message':'successfully changed password'})
    else:
        return jsonify({'success':False,'message':'Could not changed password'})
    
@app.route('/get_user_data_by_email/<email>', methods = ['GET']) #TODO get by email retard
@token_required
def getUserDataByEmail(curr_user, email): #  token_required -> curr_user
    if email is None:
        return jsonify({'success':False,'message':'no email provided'})
    
    data = database_helper.get_user_data_by_email(email)
    if data is None:
        return jsonify({'success':False,'message':'No such user'})
    else:
        data = data[0:1] + data[2:]  
        return jsonify({'success':True,'message':'Data by email sent', 'data': data})
            
@app.route('/get_user_data_by_token', methods = ['GET'])
@token_required
def getUserDataByToken(curr_user):
    data = database_helper.get_user_data_by_email(curr_user)
    return jsonify({'success':True,'message':'successfully acquired','data': data})

@app.route('/post_message', methods = ['POST'])
@token_required
def postMessage(curr_user):
    data = request.get_json()
    
    if not database_helper.validate_user(data["email"] ,""):
        return jsonify({'success':False,'message':'user does not exist'})
    message = data["message"]       
    if message is None or len(message) == 0:
        return jsonify({'success':False,'message':'Could not validate token'})
        
    if database_helper.post_message(data["email"] ,curr_user , message):
        return jsonify({'success':True,'message':'passed message'}), 201
    else:
        return jsonify({'success':False,'message':'Could not post message'})


@app.route('/get_user_messages_by_token', methods = ['GET'])
@token_required
def getWallMessagesByToken(curr_user):
    messages = database_helper.get_user_messages(curr_user) 
    return jsonify({'success':True,'message':'Could not post message', 'data': messages}), 200

@app.route('/get_user_messages_by_email/<email>', methods = ['GET'])
@token_required
def getWallMessagesByEmail(curr_user, email):
    if email is None or not database_helper.validate_user(email,""):
        return jsonify({'success':False,'message':'no such user'})
    
    messages = database_helper.get_user_messages(email)
    return jsonify({'success':True,'message':'messages passed', 'data':messages})
    




# ------ "StartUp" ------ #
if __name__ == '__main__':
    app.debug = True
    app.run()
    # can now run: python3 test.py
 