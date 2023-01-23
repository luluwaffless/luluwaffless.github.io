document.getElementById("audio").addEventListener("pause", function() {
    document.getElementById("omori").src = "images/omori.png";
});
document.getElementById("audio").addEventListener("play", function() {
    document.getElementById("omori").src = "images/omori.gif";
});