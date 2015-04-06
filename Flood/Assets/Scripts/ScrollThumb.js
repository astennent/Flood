#pragma strict

var desiredY = 0.0;

function Start() {
   setNumColors(5);
}

function setNumColors(numColors : int) {
   desiredY = -1.5 * numColors + 6;
}

function Update () {
   transform.position.y = Mathf.Lerp(transform.position.y, desiredY, .3);
}