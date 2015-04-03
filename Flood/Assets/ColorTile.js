#pragma strict

var board : Board;
var colorIndex : int;

function OnMouseDown() {
   board.ProcessClick(colorIndex);
}