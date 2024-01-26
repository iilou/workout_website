const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();
// var USEROBJECT = "";

function spotifyLinkRequest(db, user, link){
    setMusic(db, user, link);
    swapSong(link);
    return true;
}

function handleUserFound(user){
    document.getElementById("loading-cover").style.display = "none";
    document.body.style.overflowY = "auto";

    
    document.getElementById("playlist-link").addEventListener("keydown", (e) => {if(e.key == "Enter"){e.preventDefault();spotifyLinkRequest(db, user.uid, document.getElementById("playlist-link").value)}})

    getMusic(db, user.uid, (data) => {if(data=="") return; swapSong(data.uri)});
    getCurrentDay(user.uid, (cddata, rtdata) => loadRoutine(user.uid, cddata, rtdata));
}

auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    loadHeader(user);
    handleUserFound(user);
    console.log(user);
  } else {
  }
});


const getCSSVar = (x) => window.getComputedStyle(document.documentElement).getPropertyValue(x);
const setCSSVar = (x, val) => {document.documentElement.style.setProperty(x, val);}

// console.log(getCSSVar('--perc'));

function modifyProgressBar(delta, max){
    let nv = (1-parseInt(getCSSVar('--perc').split("%")[0])/100)+(delta/max);

    let pv = 100-parseInt(getCSSVar('--perc').split("%")[0]);
    let n = (Math.round((pv/100)*max)+delta)/max;

    setCSSVar('--perc', 100*(1-n)+"%");
    document.getElementById("routine-progress-bar-number").innerHTML = (n*100).toFixed(0)+"%";
}

function handleSubroutineClick(elm, i, j, cur, user, max, nm){
    if(elm.className.includes("complete")){
        elm.className = "routine-exercise-sub";
        cur.score[i][j] = false;
        if(cur.score[i]["v"]==cur.score[i]["t"]) nm.className = "routine-exercise-name";
        cur.score[i]["v"]--;
        modifyProgressBar(-1, max);

        modifyRoutineProgress(db, user, cur.score, 100-parseInt(getCSSVar('--perc').split("%")[0]));
    }
    else{
        elm.className = "routine-exercise-sub complete"
        cur.score[i][j] = true;
        cur.score[i]["v"]++;
        if(cur.score[i]["v"]==cur.score[i]["t"]) nm.className = "routine-exercise-name all-complete";
        modifyProgressBar(1, max);
        
        modifyRoutineProgress(db, user, cur.score, 1-parseInt(getCSSVar('--perc').split("%")[0])/100);
    }
}

function loadRoutine(user, cur, rout){
    const list = document.getElementById("routine-exercise-list");
    list.innerHTML = "";

    console.log(typeof(cur.day), rout, cur);

    document.getElementById("routine-title").innerHTML = `"${rout.label[cur.day]}"`;
    document.getElementById("sub-main").innerHTML = `Day ${cur.day+1}: "${rout.label[cur.day]}"`;

    let i = 0;
    let max = 0;
    let cv = 0;
    while(true){
        if(i in rout[cur.day]){
            let elm = makeElement("div", "routine-exercise");
            list.appendChild(elm);

            let nm = makeElement("div", "routine-exercise-name", rout[cur.day][i].name);
            elm.appendChild(nm);
            nm.addEventListener("click", () => elm.className.includes("show")?elm.className="routine-exercise":elm.className="routine-exercise show")

            cur.score[i]["v"] = 0;
            cur.score[i]["t"] = 0;
            for(let j = 0; j < rout[cur.day][i].set; j++){
                max++;
                let sb = makeElement("div", cur.score[i][j]?"routine-exercise-sub complete":"routine-exercise-sub", rout[cur.day][i].rep + " Reps");
                if(cur.score[i][j]) {cv++;cur.score[i]["v"]++}
                cur.score[i]["t"]++;

                elm.appendChild(sb);

                let ii = i;
                sb.addEventListener("click", () => handleSubroutineClick(sb, ii, j, cur, user, max, nm));
            }
            if(cur.score[i]["v"] == cur.score[i]["t"]) nm.className = "routine-exercise-name all-complete";

            i++;
        }
        else break;
    }

    modifyProgressBar(cv, max);
}

