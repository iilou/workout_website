// console.log("a");

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

// const defaultRoutineDay = {
//     0:{
//         name:"boo!",
//         set:3,
//         rep:15,
//         decrement:2,
//     },
//     1:{
//         name:"whoosh!",
//         set:3,
//         rep:15,
//         decrement:2,
//     },
//     2:{
//         name:"ooo!",
//         set:3,
//         rep:15,
//         decrement:2,
//     }
// }

const newUser = (user) => {
    const db = firebase.firestore();
    const user = db.collection('user').doc(user.uid).set({
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







const updateCurrentDay = (user, dayofsequence, currentDate, routineDataForDay) => {
    /**
     * dayofsequence -> int
     * currentDate -> int
     * routineDataForDay -> Obj
     */
    tempdata.currentDay[user].date = currentDate; // database write
    tempdata.currentDay[user].day = dayofsequence; // database write

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

    tempdata.currentDay[user].score = score; // database write

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

const editRoutineData = (user, newIntv, oldIntv) => {
    if(oldIntv==newIntv) return;

    tempdata.routineData[user].interval = newIntv;//database write
    tempdata.routineData[user].intervalZero = parseInt(""+new Date().getFullYear()+new Date().getMonth()+new Date().getDate());//database write

    if(newIntv>oldIntv){
        for(let i = oldIntv; i < newIntv; i++){
            tempdata.routineData[user][i] = structuredClone(defaultRoutineDay);//database write
        }
    }

    else {
        for(let i = newIntv; i < oldIntv; i++){
            delete tempdata.routineData[user][i]; //database erase? still write ig
        }
    }

    tempdata.routineData[user].label = new Array(newIntv).fill(undefined).map((val,idx) => "Day "+idx);    //not hapenning in databse, idk if we do label sht


    updateCurrentDay(user, 0, parseInt(""+new Date().getFullYear()+new Date().getMonth()+new Date().getDate()), getRoutineDataForDay(user, 0));

    addlocalstoragedata();
}
//delete current day except "date" key, change "date" key to today, add day 0 to "currentDay", all vals false



function getRoutineData(user) {
    return structuredClone(tempdata.routineData[user]); //database read
}

function getRoutineDataForDay(user, day) {
    return structuredClone(tempdata.routineData[user][day]); // database read
}

const getCurrentDay = (user, returnRoutineDataFromDay=false, routineDataForDay=null) => {
    let date = new Date();
    let dateNum = parseInt(""+date.getFullYear() + (date.getMonth()<10?"0"+date.getMonth():date.getMonth()) + (date.getDate()<10?"0"+date.getDate():date.getDate()));
    dateNum += 100;

    const currentdayindata = tempdata.currentDay[user].date; // database read

    if(dateNum == currentdayindata){
    }
    else{
        const dayzero = "" + tempdata.routineData[user].intervalZero;
        const dayinterval = tempdata.routineData[user].interval;

        let dayssince = Math.round((new Date(dayzero.substring(0, 4), dayzero.substring(4,6), dayzero.substring(6,8)).getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const currentDay = dayssince % dayinterval;

        if(routineDataForDay==null) routineDataForDay = getRoutineDataForDay(user, currentDay);
        updateCurrentDay(user, currentDay, dateNum, routineDataForDay);
    }

    if(returnRoutineDataFromDay) return [structuredClone(tempdata.currentDay[user]), routineDataForDay==null?getRoutineDataForDay(user, tempdata.currentDay[user].day):routineDataForDay]; // database read
    return structuredClone(tempdata.currentDay[user]);
}

// console.log(getCurrentDay("1111"));