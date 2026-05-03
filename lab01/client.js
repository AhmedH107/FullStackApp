displayView = function () {
  //the code required to display a view
};

window.onload = function () {
  if (!localStorage.getItem("token")) {
    let scriptTag = document.getElementById("welcomeview").innerHTML;
    let currTag = document.getElementById("currview");

    currTag.innerHTML = scriptTag;
  } else {
    let scriptTag = document.getElementById("profileview").innerHTML;
    let currTag = document.getElementById("currview");
    currTag.innerHTML = scriptTag;
    defualtTab();
  }
};

function uppdateUserInfo(id, userJsonData) {
  let data = JSON.parse(userJsonData);
  document.getElementById(id).querySelector("#userInfoEmail").innerText =
    data.email;
  document.getElementById(id).querySelector("#userInfoName").innerText =
    data.firstname;
  document.getElementById(id).querySelector("#userInfoFamilyName").innerText =
    data.familyname;
  document.getElementById(id).querySelector("#userInfoGender").innerText =
    data.gender;
  document.getElementById(id).querySelector("#userInfoCity").innerText =
    data.city;
  document.getElementById(id).querySelector("#userInfoCountry").innerText =
    data.country;
}

function defualtTab() {
  document.getElementById("Home").style.display = "block";
  document.getElementById("defualtTab").className += " active";

  let token = localStorage.getItem("token");
  let serverResponse = serverstub.getUserDataByToken(token);
  let userInfo = JSON.stringify(serverResponse.data);
  uppdateUserInfo("userInfo", userInfo);
  refreshWall(userMessageWall);
}

function postMessage(form) {
  let msg = form.message.value;

  if (msg.trim()) {
    let token = localStorage.getItem("token");
    let userData = serverstub.getUserDataByToken(token);
    let email = userData.data.email;

    let serverResponse = serverstub.postMessage(token, msg, email);
    console.log(serverResponse);
    refreshWall(userMessageWall);
  } else {
    console.log("message is empty");
  }
}

function otherUserPostMessage(form) {
  let msg = form.otherMessage.value;

  if (msg.trim()) {
    let token = localStorage.getItem("token");
    let email = document.getElementById("profileLookUp").value;

    let serverResponse = serverstub.postMessage(token, msg, email);
    console.log(email);
    console.log(serverResponse);
  } else {
    console.log("message is empty");
  }
}

function searchProfile(form) {
  let token = localStorage.getItem("token");
  let username = form.querySelector("#profileLookUp").value;
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
  }
}

function refreshWall(id) {
  let token = localStorage.getItem("token");
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
  console.log(msgs);
  //document.getElementById("userMessageWall").innerHTML = msgs;
}

function refreshSearchedWall(id) {
  let token = localStorage.getItem("token");
  let email = document
    .getElementById("searchedUserInfo")
    .querySelector("#userInfoEmail").innerText;
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
  console.log(msgs);
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
    let serverResponse = serverstub.changePassword(
      token,
      oldPassword,
      newPassword
    );
    console.log(serverResponse);
    document.getElementById("feedback").innerHTML = serverResponse.message;
  }
}

//Basic "sign" functions
function signout() {
  let token = localStorage.getItem("token");
  serverstub.signOut(token);
  console.log(token);
  localStorage.removeItem("token");
  window.onload();
}

function signin(form) {
  let email = form.querySelector("#logemail").value;
  let password = form.querySelector("#logPassword").value;

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
  }
}

function signup(form) {
  //Note side gets reloaded but that's good so we can change view maybe?
  let password = form.querySelector("#password").value;
  let reppassword = form.querySelector("#repPassword").value;
  document.getElementById("feedback").innerHTML = "";

  if (password === reppassword) {
    document.getElementById("feedback").innerHTML = "Passwords match";
  } else {
    document.getElementById("feedback").innerHTML = "Passwords NOT match";
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

  //Send data to server, handle response
  try {
    let serverResponse = serverstub.signUp(dataObject);
    document.getElementById("feedback").innerHTML = serverResponse.message;
  } catch (e) {
    document.getElementById("feedback").innerText = "Somthing went wrong";
    console.log(e);
  }
}

//Help/Auxiliary Functions
