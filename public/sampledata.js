const defaultRoutineDay = {
    0:{
        name:"boo!",
        set:3,
        rep:15,
        decrement:2,
    },
    1:{
        name:"whoosh!",
        set:3,
        rep:15,
        decrement:2,
    },
    2:{
        name:"ooo!",
        set:3,
        rep:15,
        decrement:2,
    }
}

function loadHeader(user){
    console.log("loadheader: ", user.photoURL == null, user.photoURL, user, document.querySelector(".profile_img"), document.querySelector(".profile_name"));
    document.querySelector(".profile_img").setAttribute("src", user.photoURL == null? "../temp_pfp.png" : user.photoURL);
    document.querySelector(".profile_name").innerHTML = user.displayName == null? "New User" : user.displayName;
}

const dateToString = (date) => {
    return ""+date.getFullYear() + (date.getMonth()<10?"0"+date.getMonth():date.getMonth()) + (date.getDate()<10?"0"+date.getDate():date.getDate());
}

const dateFromString = (str) => {
    return new Date(str.substring(0, 4), parseInt(str.substring(4,6)), str.substring(6,8))
}

const findCurrentDay = (data) => {
    var dayzero = "" + data.intervalZero;
    var dayinterval = parseInt(""+data.interval);

    console.log(new Date(), dateFromString(dayzero), (new Date().getTime() - dateFromString(dayzero).getTime()), (1000 * 60 * 60 * 24), Math.floor((new Date().getTime() - dateFromString(dayzero).getTime()) / (1000 * 60 * 60 * 24)));

    return Math.floor((new Date().getTime() - dateFromString(dayzero).getTime()) / (1000 * 60 * 60 * 24)) % dayinterval;
}

const newUser = (user) => {
    console.log(user);
    const db = firebase.firestore();
    const userDb = db.collection('user').doc(user.uid).set({
        displayName:"Guest",
        email:user.email,
        photoURL:"../planner/img/temp_pfp.png"
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}


const dbGETDOC = (db, collection, document, action="") => {
    let docRef = db.collection(collection).doc(document);

    docRef.get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", collection, document, doc.data(), " action: ", action);
            if(action != "") action(doc.data());
            return doc.data();
        } else {
            // doc.data() will be undefined in this case
            console.log("Document data not found:", collection, document, " action: ", action);
            if(action != "") action("");
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Document data error:", collection, document, " action: ", action);
        console.log("Error getting document:", error);
    });
}

const dbGETDOCDEEP = (db, c1, d1, c2, d2) => {
    let docRef = db.collection(c1).doc(d1).collection(c2).doc(d2);

    docRef.get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            return doc.data();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

const dbSETDOC = (db, collection, document, obj, merge=true) => {
    db.collection(collection).doc(document).set(obj, { merge: merge });
    console.log("DATABASE SET: COLLECTION:" + collection + " DOC: " + document + " OBJ:" + obj);
}

const dbDELKEY = (db, collection, document, key) => {
    db.collection(collection).doc(document).update({
        [key]: firebase.firestore.FieldValue.delete()
    })
}

const dbDELDOC = (db, collection, document) => {
    db.collection(collection).doc(document).delete();
}

const dbsetdefault = (db, user) => {
    dbSETDOC(db, "currentDay", user, defaulttempdata.currentDay["1111"]);
    dbSETDOC(db, "routineData", user, defaulttempdata.routineData["1111"]);
}


const dbSetDefaultRoutineData = (db, user) => {
    let def = {
        interval: 3,
        intervalZero: dateToString(new Date()),
        0:defaultRoutineDay,
        1:defaultRoutineDay,
        2:defaultRoutineDay,
        label:["Day 0","Day 1","Day 2"]
    };
    dbSETDOC(db, "routineData", user, def);
    return def;
}

const updateCurrentDay = (db, user, dayofsequence, currentDate, routineDataForDay) => {
    console.log("update Current Day: ", currentDate, routineDataForDay);
    let obj = {};
    obj.date = currentDate;
    obj.day = dayofsequence;

    let score = {};
    let i = 0;
    while(true){
        if(i in routineDataForDay){
            score[i] = {sets:routineDataForDay[i].set};
            for(let j = 0; j < routineDataForDay[i].set; j++){
                score[i][j] = false;
            }
        }
        else break;
        i++;
    }

    obj.score = score;

    console.log("update day: ", obj);
    dbSETDOC(db, "currentDay", user, obj, false);

    return obj;
}

const modifyRoutineProgress = (db, user, score, total) => {
    dbSETDOC(db, "currentDay", user, {["score"]:score}, true);
    dbSETDOC(db, "timelineData", user, {[dateToString(new Date())]:total}, true);
}

const editRoutineDataDay = (db, user, data, day, currentDay) => {
    let obj = {};
    obj[day] = data;
    console.log(obj);
    dbDELKEY(db, "routineData", user, day);
    dbSETDOC(db, "routineData", user, obj, true);
    if(currentDay == day) dbDELKEY(db, "currentDay", user, "score");
}

const editDayInterval = (db, user, newIntv, oldIntv, routineData) => {
    if(oldIntv==newIntv) return;

    let obj = {};
    
    obj.interval = newIntv;
    obj.intervalZero = parseInt(dateToString(new Date()));

    for(let i = 0; i < newIntv; i++){
        if(i>=oldIntv) obj[i] = structuredClone(defaultRoutineDay);
        else obj[i] = structuredClone(routineData[i]);
    }

    obj.label = new Array(newIntv).fill(undefined).map((val,idx) => "Day "+idx);

    console.log(dateToString(new Date()));
    updateCurrentDay(db, user, 0, parseInt(dateToString(new Date())), structuredClone(obj[0]));
    dbSETDOC(db, "routineData", user, obj, false);
}

const editLabel = (db, user, label) => {
    dbSETDOC(db, "routineData", user, {label:label}, true);
}

function getRoutineData(db, user, action="") {
    return dbGETDOC(db, "routineData", user, action);
}

function getRoutineDataForDay(user, day) {
    return structuredClone(tempdata.routineData[user][day]); // database read
}

const getCurrentDay = (user, after="") => {
    let date = new Date();
    let dateNum = parseInt(dateToString(new Date()));
    // let currentDay = findCurrentDay()

    dbGETDOC(db, "currentDay", user, (cddata) => {dbGETDOC(db, "routineData", user, (rtdata) => {ret(cddata, rtdata)})});

    const ret = (cddata, rtdata) => {
        console.log("ret rt", rtdata);
        console.log("ret cd", cddata, cddata==false);

        console.log(findCurrentDay(rtdata));
        if(rtdata && cddata && "date" in cddata && "day" in cddata && cddata.day == findCurrentDay(rtdata) && dateNum == cddata.date && "score" in cddata){
        // if(dateNum == cddata){
            if(after != "") after(cddata, rtdata);
            else return [cddata, rtdata];
        }
        else{
            if(!rtdata) rtdata = dbSetDefaultRoutineData(db, user);

            var currentDay = findCurrentDay(rtdata);
            var rtdataForDay = rtdata[currentDay];

            if(after != "") after(   updateCurrentDay(db, user, currentDay, dateNum, rtdataForDay), rtdata);
            else return             [updateCurrentDay(db, user, currentDay, dateNum, rtdataForDay), rtdata];
        }
    }
}

const getMusic = (db, user, action="") => {
    if(action == "") return;
    dbGETDOC(db, "music", user, action);
}

const setMusic = (db, user, link) => {
    dbSETDOC(db, "music", user, {uri: link}, false);
}