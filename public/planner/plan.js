console.log("b");

function makeElement(tagName, className, text, attr) {
    var element = document.createElement(tagName);
    element.className = className;
    if (text) {
        element.textContent = text;
    }
    if (attr) {
        for (var key in attr) {
            element.setAttribute(key, attr[key]);
        }
    }
    return element;
}

const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged((user) => {
    if (user) {
        const uid = user.uid;
        console.log(user);

        getRoutineData(db, user.uid, (data) => {
            let routineData = data;
            console.log("routinedata", routineData);

            loadHeader(user);
            loadDayFunctions(user.uid, routineData);
            loadDaySelectionButtons(user.uid, routineData);
            loadCurrentDayView(user.uid, findCurrentDay(routineData), routineData);
        })
    } else {
    }
});


const getNameInput = (i) => {return document.querySelector(".l-"+i+"-name")};
const getRepInput = (i) => {return document.querySelector(".l-"+i+"-reps")};
const getSetInput = (i) => {return document.querySelector(".l-"+i+"-sets")};
const getIconList = (i) => {return document.querySelector(".icon-list-"+i)};
const getEditButton = (i) => {return document.querySelector(".edit-"+i)};
const getTrashButton = (i) => {return document.querySelector(".del-"+i)};
const getPreviewSet = (i) => {return document.querySelector(".p-set-"+i)};
const getPreviewTxt = (i) => {return document.querySelector(".p-txt-"+i)};

const makeNameInput = (i, data) => {return makeElement("input", "l-name l-"+i+"-name "+i, false, {type:"text", readonly:true, value:data[i].name})};
const makeRepInput = (i, data) => {return makeElement("input", "l-reps l-"+i+"-reps "+i, false, {type:"text", readonly:true, value:data[i].rep})};
const makeSetInput = (i, data) => {return makeElement("input", "l-sets l-"+i+"-sets "+i, false, {type:"text", readonly:true, value:data[i].set})};

const makePreviewSet = (i, data) => {return makeElement("div", "preview-set p-set-"+i+" "+i, data[i].set+"x")};
const makePreviewTxt = (i, data) => {return makeElement("div", "preview-txt p-txt-"+i+" "+i, data[i].rep+"/"+data[i].rep+"/"+data[i].rep+" "+data[i].name)};

const changePreviewTxt = (elm, i, data) => {elm.innerHTML = data[i].rep+"/"+data[i].rep+"/"+data[i].rep+" "+data[i].name};

const changeIndexHTML = (elm, pi, i) => {elm.className = elm.className.replaceAll(pi, i)};

const getIndexFromName = (name, data) => {for(i in data) {if(data[i].name == name) return parseInt(i)};alert("couldn't find index of "+name)};
const getIndexFromHTML = (elm, targetIndex=2) => {return parseInt(elm.className.split(" ")[targetIndex])};



const makeInputRow = (list, util, data, i) => {
    let nm = makeNameInput(i, data);
    let rp = makeRepInput(i, data);
    let st = makeSetInput(i, data);

    nm.addEventListener("change", (e) => {rewriteCurrentRoutineData(data, getIndexFromHTML(nm), "name", nm.value)});
    rp.addEventListener("change", (e) => {rewriteCurrentRoutineData(data, getIndexFromHTML(rp), "rep", parseInt(rp.value))});
    st.addEventListener("change", (e) => {rewriteCurrentRoutineData(data, getIndexFromHTML(st), "set", parseInt(st.value))});

    list.appendChild(nm); list.appendChild(rp); list.appendChild(st); 

    let il = makeElement("div", "icon-list icon-list-"+i);

    let edit = makeElement("img", "edit-"+i, "", {src:"img/edit.png"});
    il.appendChild(edit);
    editWorkout(i);

    let trash = makeElement("img", "del-"+i+" "+i, "", {src:"img/trash.png"}); 
    il.appendChild(trash);
    trash.addEventListener("click", () => {deleteCurrentRoutineNode(data, getIndexFromHTML(trash, 1)); console.log(data);});

    util.appendChild(il);
}

const makePreviewRow = (pList, data, i) => {
    let st = makePreviewSet(i, data);
    let tx = makePreviewTxt(i, data);

    pList.appendChild(st);
    pList.appendChild(tx);
}

const makeGhost = (list, util, pList, data, day) => {
    let ghost = makeElement("div", "l-ghost");
    let boo = makeElement("div", "l-name boo", "+");
    ghost.appendChild(boo);
    list.appendChild(ghost);
    ghost.addEventListener("click", () => {
        addCurrentRoutineNode(data, list, pList, util, day);
    })
} 

const changeLabel = (db, user, data, day) => {
    data.label[day] = document.querySelector(".list-title").value;

    document.querySelector(".preview-title").innerHTML = data.label[day];
    document.querySelector(`.day-${day}`).innerHTML = data.label[day];

    editLabel(db, user, data.label);
}

//clone data for temp use
function getTempRoutineData(data, day){
    return structuredClone(data[day]);
}

function saveCurrentRoutineData(data, user, day, gData){
    gData[day] = structuredClone(data);

    editRoutineDataDay(db, user, data, day, findCurrentDay(gData));
}


//edit
function rewriteCurrentRoutineData(currentRoutineData, i, type, to){
    currentRoutineData[i][type] = to;
    if(type == "name" || type == "rep") changePreviewTxt(getPreviewTxt(i), i, currentRoutineData);
    else if (type == "set") getPreviewSet(i).innerHTML = to + "x";
}

//delete
function deleteCurrentRoutineNode(currentRoutineData, i){
    getNameInput(i).remove(); getRepInput(i).remove(); getSetInput(i).remove(); getIconList(i).remove(); getPreviewSet(i).remove(); getPreviewTxt(i).remove();
    
    while(true){
        console.log(i, (i+1), currentRoutineData);
        if((i+1) in currentRoutineData){
            currentRoutineData[i] = currentRoutineData[i+1];
            
            changeIndexHTML(getNameInput(i+1),  i+1, i);
            changeIndexHTML(getRepInput(i+1),   i+1, i);
            changeIndexHTML(getSetInput(i+1),   i+1, i);
            changeIndexHTML(getIconList(i+1),   i+1, i);
            changeIndexHTML(getEditButton(i+1), i+1, i);
            changeIndexHTML(getTrashButton(i+1),i+1, i);

            changeIndexHTML(getPreviewSet(i+1), i+1, i);
            changeIndexHTML(getPreviewTxt(i+1), i+1, i);
        }
        else{
            delete currentRoutineData[i];
            console.log(currentRoutineData);
            return;
        }
        i++;
    }
}

//new
function addCurrentRoutineNode(currentRoutineData, list, pList, util, day){
    let i = 0;
    while(true) { if(!(i in currentRoutineData)) {currentRoutineData[i] = {name:"boo!", rep:10, set:3}; break;} i++; }
    
    document.querySelector(".l-ghost").remove();
    makeInputRow(list, util, currentRoutineData, i);
    makeGhost(list, util, pList, currentRoutineData, day);6
    makePreviewRow(pList, currentRoutineData, i);
    
    console.log(currentRoutineData, day);
}

//page inputs to json
function getNodeFromInput(i){
    return {
        name:document.querySelector(".l-"+i+"-name").value,
        rep:parseInt(document.querySelector(".l-"+i+"-reps").value),
        set:parseInt(document.querySelector(".l-"+i+"-sets").value),
    }
}

//edit button
function editWorkout(i){
    getNameInput(i).readOnly = false;
    getRepInput(i).readOnly = false;
    getSetInput(i).readOnly = false;
}






function loadPreview(title, pList, data, day){
    title.innerHTML = data.label[day];

    for(i in data[day]) {
        makePreviewRow(pList, data[day], i);
    }
}

function loadInputFields(db, user, data, day){
    console.log(data, data[day], day);
    document.querySelector(".list-title").value = "Exercise Plan: " + data.label[day];
    document.querySelector(".list-title").addEventListener("focus", () => { document.querySelector(".list-title").value = data.label[day] })
    document.querySelector(".list-title").addEventListener("blur", () => {  document.querySelector(".list-title").value = document.querySelector(".list-title").value = "Exercise Plan: " + data.label[day] })
    document.querySelector(".list-title").addEventListener("keydown", (e) => {
        if(e.key == "Enter") {
            changeLabel(db, user, data, day);
            document.querySelector(".list-title").blur();
        }
    })

    for(let i in data[day]){ makeInputRow(document.querySelector(".list"), document.querySelector(".util"), data[day], i); }
}

function loadDaySelectionButtons(user, data){
    const container = document.querySelector(".day-selection");
    container.innerHTML = "";
    document.querySelector(".type-button").innerHTML = data.interval+"-Day Routine";
    
    for(let i = 0; i < data.interval; i++){
        let display = "label" in data?data["label"][i]:"Day "+(i+1);
        let day = makeElement("div", "day day-"+i, display);
        container.appendChild(day);
        day.addEventListener("click", () => {loadCurrentDayView(user, i, data); });
    }
}

function loadCurrentDayView(user, day, data){

    const list = document.querySelector(".list");
    const util = document.querySelector(".util");
    const previewTitle = document.querySelector(".preview-title");
    const previewList = document.querySelector(".preview-list");

    let currentRoutineData = data[day];
    document.querySelector(".save-button").replaceWith(document.querySelector(".save-button").cloneNode(true));
    document.querySelector(".save-button").addEventListener("click", (e) => saveCurrentRoutineData(currentRoutineData, user, day, data))

    for(let i = 0; i < data.interval; i++) document.querySelector(".day-"+i).className = "day day-"+i+(day==i?" current":"");

    list.innerHTML = "";
    util.innerHTML = "";
    previewTitle.innerHTML = "";
    previewList.innerHTML = "";

    loadInputFields(db, user, data, day);
    loadPreview(previewTitle, previewList, data, day);
    makeGhost(list, util, previewList, currentRoutineData, day);
}

const typeHTML = { 
    field: document.querySelector(".type-field"),
    confirm: document.querySelector(".type-confirm"),
    input: document.querySelector(".type-intv-input"),
    cancel: document.querySelector(".type-cancel")
}

function changeDayInterval(newIntv, oldIntv, routineData){
    if(oldIntv==newIntv) return;

    routineData.interval = newIntv;//database write
    

    if(newIntv>oldIntv){
        for(let i = oldIntv; i < newIntv; i++){
            routineData[i] = structuredClone(defaultRoutineDay);//database write
        }
    }

    else {
        for(let i = newIntv; i < oldIntv; i++){
            delete routineData[i]; //database erase? still write ig
        }
    }

    routineData.label = new Array(newIntv).fill(undefined).map((val,idx) => "Day "+idx);    //not hapenning in databse, idk if we do label sht
}

function loadTypeInputFields(user, data){
    typeHTML.field.style.display = "flex";
    document.querySelector(".type-confirm").addEventListener("click", () => {
        if(!isNaN(parseInt(typeHTML.input.value))) {

            editDayInterval(db, user,   parseInt(typeHTML.input.value), data.interval, data );
            changeDayInterval(          parseInt(typeHTML.input.value), data.interval, data );

            loadDaySelectionButtons(user, data);
            loadCurrentDayView(user, 0, data);
            
        }
        typeHTML.field.style.display = "none";
    })
    typeHTML.cancel.addEventListener("click", () => {typeHTML.field.style.display = "none";})
}

function loadDayFunctions(user, data){
    const type = document.querySelector(".type-button");
    type.addEventListener("click", () => { loadTypeInputFields(user, data) });
}
