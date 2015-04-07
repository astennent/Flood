#pragma strict

var desiredX = 0.0;

function Start() {
   setNumColors(5);
}

function setNumColors(numColors : int) {
   desiredX = 1.5 * numColors - 6;
}

function Update () {
   transform.position.x = Mathf.Lerp(transform.position.x, desiredX, .3);
}