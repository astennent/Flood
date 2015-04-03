#pragma strict

var board : Board;
var colorIndex : int;

private var m_enabled : boolean;

function Start() {
   SetEnabled(colorIndex <= 4);
}

function OnMouseDown() {
   if (m_enabled)
      board.ProcessClick(colorIndex);
}

function SetEnabled(enabled : boolean) {
   m_enabled = enabled;
   if (enabled) {
      var color = Tile.colors[colorIndex];
      color.a = .1;
   } else {
      color = new Color(.2, .2, .2, .1);
   }
   GetComponent.<Renderer>().material.SetColor("_TintColor", color);
}