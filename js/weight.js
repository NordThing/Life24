// Variable Declared
var index; //To store the index of the array
var weightData; //To store the collected date,weight Pair

//To get the current date 
var date = new Date();

//Parsing Last Saved-Data into the local storage 
weightData = JSON.parse(window.localStorage.getItem("weights"));

//Checks if Saved-Data exists
if(weightData == null){
    weightData = [
        ['Date', 'Weights']    
    ];
}


//Parsing Last Saved-Index into the local storage
index = parseInt(window.localStorage.getItem("index"));
if(isNaN(index)){
    index = 0;
}


//Logging to check what's the initial data
console.log("weightData : " + weightData);
console.log(weightData);
console.log("index : " + index);


//Registers the new data to the next index 
function register(){
    if(weight ==""){
        alert("Weight must be filled in to be able to save");
        return false;
    }
    alert("Weight saved for " + date);

    if(index > 0) 
        {index = parseInt(window.localStorage.getItem("index"));
        }



    weight = parseInt(document.getElementById("weight").value);
    weightData[index + 1] = [date,weight]; 
    index++;  
    window.localStorage.setItem("index",index);
    document.getElementById("weight").value = ""; //To clear the box once button is clicked
}


//Stores the new data to local-storage
function store(){
    window.localStorage.setItem("weights",JSON.stringify(weightData));
    console.log("Data Added");
}
