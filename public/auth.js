const app = firebase.app();
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    console.log(user, uid);
  } else {
  }
});
