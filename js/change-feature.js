//FEATURE TO ACCESS DIFFERENT FEATURES WITH SERVER SIDE CALLS 
function changeFeature() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("demo").innerHTML = this.responseText;
      }
    };
    xhttp.open("GET", "test.html", true);
    xhttp.send();
  }