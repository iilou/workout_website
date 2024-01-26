const app = firebase.app();
const auth = firebase.auth();

console.log("aaaa");

auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    console.log(user, uid);

    window.location.href = "../main/main.html";
  } else {
  }
});

let emInp = document.getElementById("email_box");
let pwInp = document.getElementById("password_box");

const validateEmail = (email) => {return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);};
const validatePassword = (password) => password.length<20&&password.length>5;

function handleIncorrectEmail(){

}

function handleIncorrectPassword(){

}


function requestLogin(){
    let em = emInp.value;
    let pw = pwInp.value;
    let valid = true;
  
    if(!validatePassword(pw)) {handleIncorrectPassword(); valid = false;}
    if(!validateEmail(em)) {handleIncorrectEmail(); valid = false;}
  
    console.log(em, pw);
    if(valid){
        auth.signInWithEmailAndPassword(em, pw)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            console.log(user);
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
        });
    };
}
  
  
  
document.getElementById("confirm").addEventListener("click", () => requestLogin());