function isLoggedIn(){
    return sessionStorage.getItem("loggedIn") === "true";
}

function requireLogin(){
    if(!isLoggedIn()){
        window.location.replace("login.html");
    }
}

requireLogin();