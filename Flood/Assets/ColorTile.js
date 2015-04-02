#pragma strict

var board : Board;
var numColors : int;

function OnMouseDown() {
   board.SetNumColors(numColors);
}