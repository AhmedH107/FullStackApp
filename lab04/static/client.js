let socket = null; // reset socket for testing me thinks?

function makeSocket() {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
    console.log("closed old socket connection");
  }
  socket = new WebSocket("ws://127.0.0.1:5000/echo");
  console.log("socket is open");
  socket.onopen = () => {
    socket.send(localStorage.getItem("token"));
    console.log("sent token to socket");
  };

  socket.onmessage = (event) => {
    if (event.data == "sign out") {
      socket.close();
      localStorage.removeItem("token");
      window.onload();
      window.alert("You have been forcefully logged out");
      console.log("you should log out");
    }
  };
}

window.onload = function () {
  if (!localStorage.getItem("token")) {
    let scriptTag = document.getElementById("welcomeview").innerHTML;
    let currTag = document.getElementById("currview");

    currTag.innerHTML = scriptTag;
  } else {
    let scriptTag = document.getElementById("profileview").innerHTML;
    let currTag = document.getElementById("currview");
    currTag.innerHTML = scriptTag;

    makeSocket();

    defualtTab();
  }
};

function uppdateUserInfo(id, userJsonData) {
  let data = userJsonData;
  document.getElementById(id).querySelector("#userInfoEmail").innerText =
    data[0];
  document.getElementById(id).querySelector("#userInfoName").innerText =
    data[2];
  document.getElementById(id).querySelector("#userInfoFamilyName").innerText =
    data[3];
  document.getElementById(id).querySelector("#userInfoGender").innerText =
    data[4];
  document.getElementById(id).querySelector("#userInfoCity").innerText =
    data[5];
  document.getElementById(id).querySelector("#userInfoCountry").innerText =
    data[6];
}

//aweful way to do this but works for now
function uppdateSearchedUserInfo(id, userJsonData) {
  let data = userJsonData;
  document.getElementById(id).querySelector("#userInfoEmail").innerText =
    data[0];
  document.getElementById(id).querySelector("#userInfoName").innerText =
    data[1];
  document.getElementById(id).querySelector("#userInfoFamilyName").innerText =
    data[2];
  document.getElementById(id).querySelector("#userInfoGender").innerText =
    data[3];
  document.getElementById(id).querySelector("#userInfoCity").innerText =
    data[4];
  document.getElementById(id).querySelector("#userInfoCountry").innerText =
    data[5];
}

async function defualtTab() {
  document.getElementById("Home").style.display = "block";
  document.getElementById("defualtTab").className += " active";
  let token = localStorage.getItem("token");

  try {
    let data = await getUserDataByToken(token);
    console.log(data);
    uppdateUserInfo("userInfo", data);
    refreshWall(userMessageWall);
  } catch (error) {
    console.log(error);
  }
}

async function searchProfile(form) {
  let token = localStorage.getItem("token");
  let username = form.querySelector("#profileLookUp").value;

  let response = await getUserDataByEmail(token, username);
  console.log(response);

  if (!response.success) {
    document.getElementById("searchedUserFeedback").innerHTML =
      response.message;
  } else {
    //change innerhtml somehow i guess.
    document.getElementById("searchedUserFeedback").innerHTML = "";
    document.getElementById("searchedUserMessageFeedback").innerHTML = "";
    let userInfo = response.data;
    uppdateSearchedUserInfo("searchedUserInfo", userInfo);
    document.getElementById("searchedUserInfo").style.display = "block";
    document.getElementById("searchedUserPost").innerHTML =
      document.getElementById("postOnOtherWall").innerText;
    document.getElementById("searchedUserWall").innerHTML =
      document.getElementById("searchedWallCode").innerHTML;
    refreshSearchedWall(searchedMessageWall);
  }
}



// -------  Comunication func.  ------- //

// Could combine the two "UserPostMessage" (TODO)
//    code is really similar 
async function postMessage(form) {  //home
  let token = localStorage.getItem("token");
  let msg = form.message.value;
  let feedback = "homeMessageFeedback";
  document.getElementById(feedback).innerHTML = "";

  try {
    let data = await getUserDataByToken(token);

    if (msg.trim()) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "http://127.0.0.1:5000/post_message", true);
      xhr.setRequestHeader("Authorization", token);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.responseType = 'json';

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            refreshWall(userMessageWall);
          } 
          else if (xhr.status === 401) {
            let message = "UnAuthorized to post message";
            document.getElementById(feedback).innerHTML = message;
          } 
          else if (xhr.status === 400) {
            let message = "Messege is il-formed";
            document.getElementById(feedback).innerHTML = message;
          } 
          else if (xhr.status === 500 && xhr.response.message == "Could not post message" ) { 
            let message = "Server could not post message";
            document.getElementById(feedback).innerHTML = message;
          } 
          else {
            let message = "Something unexpexted went wrong!";
            document.getElementById(feedback).innerHTML = message;
          }
        }
      };
      let dataObject = {
        token: token,
        email: data[0],
        message: msg,
      };
      xhr.send(JSON.stringify(dataObject));
    }
    else {
      let message = "Empty message!";
      document.getElementById(feedback).innerHTML = message;
    }
  } catch (error) {
    let message = "error - something wrong!!!!";
    document.getElementById(feedback).innerHTML = message;
  }
}

function otherUserPostMessage(form) {   //browse
  let msg = form.otherMessage.value;
  let feedback = "searchedUserMessageFeedback";
  document.getElementById(feedback).innerHTML = "";


  if (msg.trim()) {
    let token = localStorage.getItem("token");
    let email = document.getElementById("profileLookUp").value;

    try {
      if (msg.trim()) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:5000/post_message", true);
        xhr.setRequestHeader("Authorization", token);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.responseType = 'json';

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 201) {
              refreshSearchedWall(searchedMessageWall);
            }          
            else if (xhr.status === 401) {
              let message = "UnAuthorized to post message";
              document.getElementById(feedback).innerHTML = message;
            } 
            else if (xhr.status === 400) {
              let message = "Messege is il-formed";
              document.getElementById(feedback).innerHTML = message;
            } 
            else if (xhr.status === 500 && xhr.response.message == "Could not post message" ) { 
              let message = "Server could not post message";
              document.getElementById(feedback).innerHTML = message;
            } 
            else {
              let message = "Something unexpexted went wrong!";
              document.getElementById(feedback).innerHTML = message;
            }
          }
        };
        let dataObject = {
          token: token,
          email: email,
          message: msg,
        };
        xhr.send(JSON.stringify(dataObject));
      } 
      else {
        console.log("empty msg");
      }
    } catch (error) {
      let message = "error - something wrong!!!!";
      document.getElementById(feedback).innerHTML = message;
    }
  } else {
    let message = "Empty message!";
    document.getElementById(feedback).innerHTML = message;
  }
}

function refreshWall(id) {
  let token = localStorage.getItem("token");
  let feedback = "homeMessageFeedback";

  let xhr = new XMLHttpRequest();
  xhr.open("GET", "http://127.0.0.1:5000/get_user_messages_by_token", true);
  xhr.setRequestHeader("Authorization", token);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let msgWall = id;
        //let messages = JSON.stringify(serverResponse);
        msgWall.innerHTML = "";
        let msgs = "";

        let response = JSON.parse(xhr.response);

        let data = response.data;
        //data[x] = message, data[x][0] = sent by, data[x][1] = message content
        for (i in data) {
          let newMsg = data[i][0];
          newMsg += ":" + data[i][1];
          let newItem = document.createElement("li");
          newItem.textContent = newMsg;
          msgWall.appendChild(newItem);
        }
      } 
      else if (xhr.status === 401) {
        let message = "UnAuthorized to get messages";
        document.getElementById(feedback).innerHTML = message;
      } 
      else {
        let message = "UnAuthorized to get messages";
        document.getElementById(feedback).innerHTML = message;
      }
    }
  };
  xhr.send();
}

function refreshSearchedWall(id) {
  let feedback = "searchedUserMessageFeedback";
  let token = localStorage.getItem("token");
  let email = document
    .getElementById("searchedUserInfo")
    .querySelector("#userInfoEmail").innerText;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", "/get_user_messages_by_email/" + email, true);
  xhr.setRequestHeader("Authorization", token);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let msgWall = id;
        msgWall.innerHTML = "";
        let msgs = "";

        let response = JSON.parse(xhr.response);
        let data = response.data;
        // Show msg's 
        //    data[x] = message, data[x][0] = sent by, data[x][1] = message content
        for (i in data) {
          let newMsg = data[i][0];
          newMsg += ":" + data[i][1];
          let newItem = document.createElement("li");
          newItem.textContent = newMsg;
          msgWall.appendChild(newItem);
        }
      } 
      else if (xhr.status === 401) {
        let message = "UnAuthorized to get messages";
        document.getElementById(feedback).innerHTML = message;
      } 
      else if (xhr.status === 404) {
        let message = "Serched after user does not exist";
        document.getElementById(feedback).innerHTML = message;
      } 
      else {
        let message = "UnAuthorized to get messages";
        document.getElementById(feedback).innerHTML = message;
      }
    }
  };
  xhr.send();
}




// ----- Basic functions ------

function changeTab(evt, id) {
  //console.log(evt);
  let i, tabcontent, tablinks;
  //display set to none
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(id).style.display = "block";
  evt.currentTarget.className += " active";
}

function changePassword(form) {
  let oldPassword = form.querySelector("#oldPassword").value;
  let newPassword = form.querySelector("#newPassword").value;
  let confirmedNewPassword = form.querySelector("#confirmedNewPassword").value;
  let token = localStorage.getItem("token");

  if (newPassword != confirmedNewPassword) {
    let message = "New password didn't match the old password";
    document.getElementById("feedback").innerHTML = message;
  } 
  else {
    let dataObject = {
      oldpassword: oldPassword,
      newpassword: newPassword,
    };
    let token = localStorage.getItem("token");
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://127.0.0.1:5000/change_password", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", token);
    xhr.responseType = 'json';

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let message = "Change password succeeded";
          document.getElementById("feedback").innerHTML = message;
        } 
        else if (xhr.status === 401) {
          let message = "UnAuthorized to do that";
          document.getElementById("feedback").innerHTML = message;
        } 
        else if (xhr.status === 400) {
          if (xhr.response.message == "Current password does not match"){
            let message = "Current password not valid";
            document.getElementById("feedback").innerHTML = message;
          }
          else if (xhr.response.message == "new password too short") {
            let message = "new password too short";
            document.getElementById("feedback").innerHTML = message;
          }
          else {
            let message = "request is malfored!";
            document.getElementById("feedback").innerHTML = message;
          }
        } 
        else if (xhr.status === 500 && xhr.response.message == "Could not change password") {
          let message = "Failed in changing password. Try again later!";
          document.getElementById("feedback").innerHTML = message;
        }
        else {
          let message = "Something went wrong!";
          document.getElementById("feedback").innerHTML = message;
        }
      }
    };
    xhr.send(JSON.stringify(dataObject));
  }
}

//Basic "sign" functions
function signout() {
  let token = localStorage.getItem("token");
  let xhr = new XMLHttpRequest();
  xhr.open("DELETE", "http://127.0.0.1:5000/sign_out", true);
  xhr.setRequestHeader("Authorization", token);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        socket.close();
        localStorage.removeItem("token");
        window.onload();
      } 
      else if (xhr.status === 401) {
        let message = "UnAuthorized to do that";
        document.getElementById("feedback").innerHTML = message;
      }  
      else {
        let message = "Something went wrong!";
        document.getElementById("feedback").innerHTML = message;
      }
    }
  };
  xhr.send();
}

function signin(form) {
  let dataObject = {
    username: form.querySelector("#logemail").value,
    password: form.querySelector("#logPassword").value,
  };

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://127.0.0.1:5000/sign_in", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.responseType = 'json';

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 201) {
        let response = xhr.response //JSON.parse(xhr.response);
        let token = response.data;
        localStorage.setItem("token", token);
        signedIn = true;

        //makeSocket();
        window.onload();
      } else if (xhr.status === 400) {
        let message = "Incorrect email and/or password";
        document.getElementById("feedback").innerHTML = message;
      } else if (xhr.status === 401 && xhr.response.message == "password does not match") {
        let message = "Password is wrong";
        document.getElementById("feedback").innerHTML = message;
      } else if (xhr.status === 401) {
        let message = "UnAuthorized to do that";
        document.getElementById("feedback").innerHTML = message;
      } else if (xhr.status === 509) {  //TODO: Remove, not coorert code 
        let message = "Server side: " + JSON.parse(xhr.response).message;
        document.getElementById("feedback").innerHTML = message;
      } else {
        let message = "Something went very wrong! Client-side";
        document.getElementById("feedback").innerHTML = message;
      }
    }
  };
  console.log(dataObject);
  xhr.send(JSON.stringify(dataObject));
}

function signup(form) {
  //Note side gets reloaded but that's good so we can change view maybe?
  let password = form.querySelector("#password").value;
  let reppassword = form.querySelector("#repPassword").value;
  document.getElementById("feedback").innerHTML = "";

  if (password !== reppassword) {
    let message = "Passwords is not the same";
    document.getElementById("feedback").innerHTML = message;
  }

  let dataObject = {
    email: form.querySelector("#email").value,
    password: form.querySelector("#password").value,
    firstname: form.querySelector("#firstName").value,
    familyname: form.querySelector("#familyName").value,
    gender: form.querySelector("#gender").value,
    city: form.querySelector("#city").value,
    country: form.querySelector("#country").value,
  };

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://127.0.0.1:5000/sign_up", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 201) {
        let message = "Contact saved successfully";
        document.getElementById("feedback").innerHTML = message;
      } else if (xhr.status === 400) {
        let message = "Something wrong with data!";
        document.getElementById("feedback").innerHTML = message;
      } else if (xhr.status === 409) {
        let message = "A user with that email already exists!";
        document.getElementById("feedback").innerHTML = message;
      } else {
        document.getElementById("feedback").innerHTML = "Something went wrong!";
      }
    }
  };
  xhr.send(JSON.stringify(dataObject));
}

//Help/Auxiliary Functions

async function getUserDataByEmail(token, email) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      "http://127.0.0.1:5000/get_user_data_by_email/" + email,
      true
    );
    xhr.setRequestHeader("Authorization", token);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let response = JSON.parse(xhr.response);
          resolve(response);
        } 
        else if (xhr.status === 404) {
          let dataObject = {"message": "Not found", "success": false}
          resolve(dataObject);
        }
        else {
          let response = JSON.parse(xhr.response);
          resolve(response);
          //reject("unable to fetch user data by email");
        }
      }
    };
    xhr.send();
  });
}

async function getUserDataByToken(token) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://127.0.0.1:5000/get_user_data_by_token", true);
    xhr.setRequestHeader("Authorization", token);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let response = JSON.parse(xhr.response);
          resolve(response.data);
        } else {
          reject("unable to fetch user data by token");
        }
      }
    };
    xhr.send();
  });
}
