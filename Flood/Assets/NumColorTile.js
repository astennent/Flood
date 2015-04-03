#pragma strict

var board : Board;
var numColors : int;

function Start() {
   GetComponent.<Renderer>().enabled = false;
}

function OnMouseDown() {
   board.SetNumColors(numColors);
}