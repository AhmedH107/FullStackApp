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

  /*let token = localStorage.getItem("token");
  let serverResponse = serverstub.getUserDataByToken(token);
  let userInfo = JSON.stringify(serverResponse.data);
  uppdateUserInfo("userInfo", userInfo);
  refreshWall(userMessageWall);*/
}

async function postMessage(form) {
  let token = localStorage.getItem("token");
  let msg = form.message.value;

  try {
    let data = await getUserDataByToken(token);

    if (msg.trim()) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "http://127.0.0.1:5000/post_message", true);
      xhr.setRequestHeader("Authorization", token);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            refreshWall(userMessageWall);
          } else if (xhr.status === 401) {
            document.getElementById("feedback").innerHTML =
              "Sonmething wrong with token!";
          } else {
            document.getElementById("feedback").innerHTML =
              "Something went wrong!";
          }
        }
      };
      let dataObject = {
        token: token,
        email: data[0],
        message: msg,
      };
      xhr.send(JSON.stringify(dataObject));
    } else {
      console.log("empty msg");
    }

    /*let token = localStorage.getItem("token");
    let userData = serverstub.getUserDataByToken(token);
    let email = userData.data.email;

    let serverResponse = serverstub.postMessage(token, msg, email);
    console.log(serverResponse);
    refreshWall(userMessageWall);
  } else {
    console.log("message is empty");
  }*/
  } catch (error) {
    console.log("something wrong");
  }
}

function otherUserPostMessage(form) {
  let msg = form.otherMessage.value;

  if (msg.trim()) {
    let token = localStorage.getItem("token");
    let email = document.getElementById("profileLookUp").value;

    try {
      if (msg.trim()) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:5000/post_message", true);
        xhr.setRequestHeader("Authorization", token);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 201) {
              refreshSearchedWall(searchedMessageWall);
            } else if (xhr.status === 401) {
              document.getElementById("feedback").innerHTML =
                "Sonmething wrong with token!";
            } else {
              document.getElementById("feedback").innerHTML =
                "Something went wrong!";
            }
          }
        };
        let dataObject = {
          token: token,
          email: email,
          message: msg,
        };
        xhr.send(JSON.stringify(dataObject));
      } else {
        console.log("empty msg");
      }

      /*let token = localStorage.getItem("token");
      let userData = serverstub.getUserDataByToken(token);
      let email = userData.data.email;
  
      let serverResponse = serverstub.postMessage(token, msg, email);
      console.log(serverResponse);
      refreshWall(userMessageWall);
    } else {
      console.log("message is empty");
    }*/
    } catch (error) {
      console.log("something wrong");
    }
  } else {
    console.log("message is empty");
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
    let userInfo = response.data;
    uppdateSearchedUserInfo("searchedUserInfo", userInfo);
    document.getElementById("searchedUserInfo").style.display = "block";
    document.getElementById("searchedUserPost").innerHTML =
      document.getElementById("postOnOtherWall").innerText;
    document.getElementById("searchedUserWall").innerHTML =
      document.getElementById("searchedWallCode").innerHTML;
    refreshSearchedWall(searchedMessageWall);
  }
  /*
  let serverResponse = serverstub.getUserDataByEmail(token, username);
  if (!serverResponse.success) {
    document.getElementById("searchedUserFeedback").innerHTML =
      "User doesn't exist";
    console.log("user doesn't exists");
  } else {
    //change innerhtml somehow i guess.
    document.getElementById("searchedUserFeedback").innerHTML = "";
    let userInfo = JSON.stringify(serverResponse.data);
    uppdateUserInfo("searchedUserInfo", userInfo);
    document.getElementById("searchedUserInfo").style.display = "block";
    document.getElementById("searchedUserPost").innerHTML =
      document.getElementById("postOnOtherWall").innerText;
    document.getElementById("searchedUserWall").innerHTML =
      document.getElementById("searchedWallCode").innerHTML;
    refreshSearchedWall(searchedMessageWall);
  }*/
}

function refreshWall(id) {
  let token = localStorage.getItem("token");

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
      } else if (xhr.status === 401) {
        document.getElementById("feedback").innerHTML =
          "Sonmething wrong with token!";
      } else {
        document.getElementById("feedback").innerHTML = "Something went wrong!";
      }
    }
  };
  xhr.send();

  /*
  let serverResponse = serverstub.getUserMessagesByToken(token).data;
  //let msgWall = document.getElementById("userMessageWall");
  let msgWall = id;
  //let messages = JSON.stringify(serverResponse);
  msgWall.innerHTML = "";
  let msgs = "";
  console.log(serverResponse);
  for (i in serverResponse) {
    let newMsg = serverResponse[i].writer;
    newMsg += ":" + serverResponse[i].content;
    let newItem = document.createElement("li");
    newItem.textContent = newMsg;
    msgWall.appendChild(newItem);
  }
  console.log(msgs);*/
  //document.getElementById("userMessageWall").innerHTML = msgs;
}

function refreshSearchedWall(id) {
  let token = localStorage.getItem("token");
  let email = document
    .getElementById("searchedUserInfo")
    .querySelector("#userInfoEmail").innerText;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", "/get_user_messages_by_email/" + email, true);
  xhr.setRequestHeader("Authorization", token);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
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
    } else if (xhr.status === 401) {
      document.getElementById("feedback").innerHTML =
        "Sonmething wrong with token!";
    } else {
      document.getElementById("feedback").innerHTML = "Something went wrong!";
    }
  };
  xhr.send();

  /*
  let serverResponse = serverstub.getUserMessagesByEmail(token, email).data;
  //let msgWall = document.getElementById("userMessageWall");
  let msgWall = id;
  //let messages = JSON.stringify(serverResponse);
  msgWall.innerHTML = "";
  let msgs = "";
  console.log(serverResponse);
  for (i in serverResponse) {
    let newMsg = serverResponse[i].writer;
    newMsg += ":" + serverResponse[i].content;
    let newItem = document.createElement("li");
    newItem.textContent = newMsg;
    msgWall.appendChild(newItem);
  }
  console.log(msgs);*/
  //document.getElementById("userMessageWall").innerHTML = msgs;
}

// ----- Basic functions ------

function changeTab(evt, id) {
  console.log(evt);

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
    document.getElementById("feedback").innerHTML =
      "New password confimation didn't match";
  } else {
    let dataObject = {
      oldpassword: oldPassword,
      newpassword: newPassword,
    };
    let token = localStorage.getItem("token");
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://127.0.0.1:5000/change_password", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", token);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          document.getElementById("feedback").innerHTML = "sure whatevs";
        } else if (xhr.status === 401) {
          document.getElementById("feedback").innerHTML =
            "Sonmething wrong with token!";
        } else {
          document.getElementById("feedback").innerHTML =
            "Something went wrong!";
        }
      }
    };
    xhr.send(JSON.stringify(dataObject));

    //document.getElementById("feedback").innerHTML = serverResponse.message;
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
      } else if (xhr.status === 401) {
        document.getElementById("feedback").innerHTML =
          "Sonmething wrong with token!";
      } else {
        document.getElementById("feedback").innerHTML = "Something went wrong!";
      }
    }
  };
  xhr.send();
}

function signin(form) {
  //let email = form.querySelector("#logemail").value;
  //let password = form.querySelector("#logPassword").value;

  let dataObject = {
    username: form.querySelector("#logemail").value,
    password: form.querySelector("#logPassword").value,
  };

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://127.0.0.1:5000/sign_in", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 201) {
        //console.log(JSON.parse(xhr.response));
        let response = JSON.parse(xhr.response);
        let token = response.data;
        //console.log(token);
        localStorage.setItem("token", token);
        signedIn = true;
        //makeSocket();
        window.onload();
      } else if (xhr.status === 400) {
        document.getElementById("feedback").innerHTML =
          "Sonmething wrong with data!";
      } else {
        document.getElementById("feedback").innerHTML = "Something went wrong!";
      }
    }
  };
  console.log(dataObject);
  xhr.send(JSON.stringify(dataObject));

  /*
  try {
    let serverResponse = serverstub.signIn(email, password);
    document.getElementById("feedback").innerHTML = serverResponse.message;
    if (serverResponse.success) {
      localStorage.setItem("token", serverResponse.data);
      window.onload();
    }
  } catch (e) {
    document.getElementById("feedback").innerHTML =
      "Somthing went wrong - signIn";
    console.log(e);
  }*/
}

function signup(form) {
  //Note side gets reloaded but that's good so we can change view maybe?
  let password = form.querySelector("#password").value;
  let reppassword = form.querySelector("#repPassword").value;
  document.getElementById("feedback").innerHTML = "";

  if (password !== reppassword) {
    document.getElementById("feedback").innerHTML =
      "Sonmething wrong with data!";
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
        // some UI update.
        document.getElementById("feedback").innerHTML =
          "Contact saved successfully";
      } else if (xhr.status === 400) {
        document.getElementById("feedback").innerHTML =
          "Sonmething wrong with data!";
      } else {
        document.getElementById("feedback").innerHTML = "Something went wrong!";
      }
    }
  };
  xhr.send(JSON.stringify(dataObject));

  /*//Send data to server, handle response
  try {
    let serverResponse = serverstub.signUp(dataObject);
    document.getElementById("feedback").innerHTML = serverResponse.message;
  } catch (e) {
    document.getElementById("feedback").innerText = "Somthing went wrong";
    console.log(e);
  }*/
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
        } else {
          reject("unable to fetch user data by email");
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
