const defaulttempdata = () => {return {
    users:{
        "1111":{
            username:"",
            displayName:"",
            pw:""
        }
    },

    timelineData:{
        "1111":{
            "20240114":1,
            "20240115":0.5
        }
    },

    routineData:{
        "1111":{
            interval:3,
            intervalZero:20241118,
            playlistType:"spotify",
            label:["Arms", "Abs", "Legs"],
            currentDaySnapshot:{
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
}}


const addlocalstoragedata = () => {
    localStorage.setItem("temp", JSON.stringify(tempdata));
}

const getlocalstoragedata = () => {
    return JSON.parse(localStorage.getItem("temp"));
}

// const tempdata = defaulttempdata();
// addlocalstoragedata();
const tempdata = getlocalstoragedata(); // doesnt happen in actual program, makeshift database

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

const editRoutineDataDay = (data, uid, day) => {
    tempdata.routineData[uid][day] = structuredClone(data); // databse write

    addlocalstoragedata();
}

const editRoutineData = (user, newIntv, oldIntv) => {
    if(oldIntv==newIntv) return;

    tempdata.routineData[user].interval = newIntv;//database write

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

    addlocalstoragedata();
}

const getRoutineData = (user) => {
    return tempdata.routineData[user]; //database read
}