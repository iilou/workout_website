const app = firebase.app();
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    console.log(user, uid);

    // window.location.href = "../main/main.html";
  } else {
  }
});



let emInp = document.getElementById("email_box");
let userInp = document.getElementById("username_box");
let pwInp = document.getElementById("password_box");

const validateEmail = (email) => {return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);};
const validatePassword = (password) => password.length<20&&password.length>5;

function handleIncorrectEmail(){

}

function handleIncorrectPassword(){

}

function requestSignUp(){
  let em = emInp.value;
  let un = userInp.value;
  let pw = pwInp.value;
  let valid = true;

  if(un == "") un = "Ghost";
  if(!validatePassword(pw)) {handleIncorrectPassword(); valid = false;}
  if(!validateEmail(em)) {handleIncorrectEmail(); valid = false;}

  console.log(em, pw);
  if(valid){
    auth.createUserWithEmailAndPassword(em, pw)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        user.displayName = un;
        console.log(user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage, em, pw);
        // ..
      }
    )
  };
}



document.getElementById("confirm").addEventListener("click", () => requestSignUp());