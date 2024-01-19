

const defaulttempdata ={
    users:{
        "1111":{
            username:"",
            displayName:"",
            pw:""
        }
    },

    timelineData:{
        "1111":{}
    },
    
    currentDay:{
        "1111":{
            playlistType:"spotify",
            date:20240118,
            day:0,

            score:{
                0:{
                    sets:3,
                    0:false,
                    1:false,
                    2:false,
                },
                1:{
                    sets:3,
                    0:false,
                    1:false,
                    2:false,
                },
                2:{
                    sets:3,
                    0:false,
                    1:false,
                    2:false,
                },
                3:{
                    sets:3,
                    0:false,
                    1:false,
                    2:false,
                },
            }
        }

    },

    routineData:{
        "1111":{
            interval:3,
            intervalZero:20240109,
            label:["Arms", "Abs", "Legs"],
            

            0:{
                0:{
                    name:"PushUps",
                    set:3,
                    rep:15,
                    decrement:2,
                },
                1:{
                    name:"Bicep Curls",
                    weight:20,
                    set:3,
                    rep:20,
                    decrement:3
                },
                2:{
                    name:"Sit Ups",
                    set:3,
                    rep:25,
                    decrement:0,
                },
                3:{
                    name:"Leg Raises",
                    set:3,
                    rep:12,
                    decrement:1
                }
            },
            1:{
                0:{
                    name:"Sit Ups",
                    set:3,
                    rep:25,
                    decrement:0,
                },
                1:{
                    name:"Leg Raises",
                    set:3,
                    rep:12,
                    decrement:1
                }
            },
            2:{
                0:{
                    name:"Squats",
                    weight:20,
                    weightIncrement:1,
                    weightSnap:5,
                    set:3,
                    rep:15,
                    decrement:2,
                },
                1:{
                    name:"Pistol Squat",
                    set:3,
                    rep:5,
                    decrement:2
                }
            }
        }
    }
}


const addlocalstoragedata = () => {
    localStorage.setItem("temp", JSON.stringify(tempdata));
}

const getlocalstoragedata = () => {
    return JSON.parse(localStorage.getItem("temp"));
}

const tempdata = defaulttempdata;
addlocalstoragedata();
// const tempdata = getlocalstoragedata(); // doesnt happen in actual program, makeshift database

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

const newUser = (user) => {
    console.log(user);
    const db = firebase.firestore();
    const userDb = db.collection('user').doc(user.uid).set({
        displayName:"iilou",
        email:user.email,
        photo:"../planner/img/temp_pfp.png"
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
}


const dbGETDOC = (db, collection, document) => {
    let docRef = db.collection(collection).doc(document);

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
}

const dbDELDOC = (db, collection, document) => {
    db.collection(collection).doc(document).delete();
}

const dbsetdefault = (db, user) => {
    dbSETDOC(db, "currentDay", user, defaulttempdata.currentDay["1111"]);
    dbSETDOC(db, "routineData", user, defaulttempdata.routineData["1111"]);
}



const updateCurrentDay = (db, user, dayofsequence, currentDate, routineDataForDay) => {
    /**
     * dayofsequence -> int
     * currentDate -> int
     * routineDataForDay -> Obj
     */
    let obj = {};
    // tempdata.currentDay[user].date = currentDate; // database write
    // tempdata.currentDay[user].day = dayofsequence; // database write
    obj.date = currentDate; // database write
    obj.day = dayofsequence; // database write

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

    obj.score = score; // database write

    dbSETDOC(db, "currentDay", user, obj, false);

    return obj;
}

const modifyRoutineProgress = (user, i,j, val, total) => {
    tempdata.currentDay[user].score[i][j] = val; // database write

    let date = new Date();
    // database write
    tempdata.timelineData[user][parseInt(""+date.getFullYear() + (date.getMonth()<10?"0"+date.getMonth():date.getMonth()) + (date.getDate()<10?"0"+date.getDate():date.getDate()))] = total;
    addlocalstoragedata();
}

const editRoutineDataDay = (data, uid, day) => {
    tempdata.routineData[uid][day] = structuredClone(data); // databse write

    updateCurrentDay(uid, day, parseInt(""+new Date().getFullYear()+new Date().getMonth()+new Date().getDate()), structuredClone(data));

    addlocalstoragedata();
}
//change current day, change all to false

const editRoutineData = (db, user, routineData, newIntv, oldIntv) => {
    if(oldIntv==newIntv) return;

    let obj = {};
    
    obj.interval = newIntv;//database write
    obj.intervalZero = parseInt(""+new Date().getFullYear()+new Date().getMonth()+new Date().getDate());//database write

    // tempdata.routineData[user].interval = newIntv;//database write
    // tempdata.routineData[user].intervalZero = parseInt(""+new Date().getFullYear()+new Date().getMonth()+new Date().getDate());//database write

    // for(let i = 0; i < newIntv; i++){
    //     if(i>=oldIntv) obj[i] = structuredClone(defaultRoutineDay);
    //     else obj[i] = structuredClone(routineData[i]);
    // }


    // if(newIntv>oldIntv){
    //     for(let i = oldIntv; i < newIntv; i++){
    //         tempdata.routineData[user][i] = structuredClone(defaultRoutineDay);//database write
    //         obj[i] = structuredClone(defaultRoutineDay);//database write
    //     }
    // }

    // else {
    //     for(let i = newIntv; i < oldIntv; i++){
    //         // delete tempdata.routineData[user][i]; //database erase? still write ig
    //         // dbDEL
    //     }
    // }

    // obj.label = new Array(newIntv).fill(undefined).map((val,idx) => "Day "+idx);    //not hapenning in databse, idk if we do label sht

    updateCurrentDay(user, 0, parseInt(""+new Date().getFullYear()+new Date().getMonth()+new Date().getDate()), structuredClone(obj[0]));

    // addlocalstoragedata();
    dbSETDOC(db, "routineData", user, obj, false);
}
//delete current day except "date" key, change "date" key to today, add day 0 to "currentDay", all vals false

function getRoutineData(db, user) {
    return dbGETDOC(db, "routineData", user);
    // return structuredClone(tempdata.routineData[user]); //database read
}

function getRoutineDataForDay(user, day) {
    return structuredClone(tempdata.routineData[user][day]); // database read
}

// const getCurrentDay = (db, user) => {
const getCurrentDay = (user, routineDataForDay=null) => {
    let date = new Date();
    let dateNum = parseInt(""+date.getFullYear() + (date.getMonth()<10?"0"+date.getMonth():date.getMonth()) + (date.getDate()<10?"0"+date.getDate():date.getDate()));
    dateNum += 100;

    // const currentdayindata = tempdata.currentDay[user].date; // database read
    const currentdayindata = dbGETDOC(db, "currentDay", user); 
    const routineData = getRoutineData(db, user);

    if(dateNum == currentdayindata.date){
    // if(dateNum == currentdayindata){
        return [currentdayindata, routineData[currentdayindata.day]];
    }
    else{

        const dayzero = routineData.intervalZero;
        const dayinterval = routineData.interval;

        let dayssince = Math.round((new Date(dayzero.substring(0, 4), dayzero.substring(4,6), dayzero.substring(6,8)).getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const currentDay = dayssince % dayinterval;

        const routineDataForDay = routineData[currentDay];

        return [updateCurrentDay(user, currentDay, dateNum, routineDataForDay), routineDataForDay];
    }


    // else{
    //     const dayzero = "" + tempdata.routineData[user].intervalZero;
    //     const dayinterval = tempdata.routineData[user].interval;

    //     let dayssince = Math.round((new Date(dayzero.substring(0, 4), dayzero.substring(4,6), dayzero.substring(6,8)).getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    //     const currentDay = dayssince % dayinterval;

    //     if(routineDataForDay==null) routineDataForDay = getRoutineDataForDay(user, currentDay);
    //     updateCurrentDay(user, currentDay, dateNum, routineDataForDay);
    // }

    // if(returnRoutineDataFromDay) return [structuredClone(tempdata.currentDay[user]), routineDataForDay==null?getRoutineDataForDay(user, tempdata.currentDay[user].day):routineDataForDay]; // database read
    // return structuredClone(tempdata.currentDay[user]);
}

// console.log(getCurrentDay("1111"));