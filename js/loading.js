const timer = 3000;
var width = 0;
var element = document.getElementById("progressBar");
var textElement = document.getElementById("percentage");

window.onload = function(){
    var interval = setInterval(function(){
        width++;
        element.style.width = width + "%";
        textElement.textContent = width + "%";

        if(width >= 100){
            clearInterval(interval);
        }
    }, 25);

    setTimeout(function(){
        window.location.href = "homepage.html";
    }, timer);
};