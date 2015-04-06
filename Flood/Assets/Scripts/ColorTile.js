#pragma strict

var board : Board;
var colorIndex : int;
var defaultMaterial : Material;

private var m_enabled : boolean;

function Start() {
   defaultMaterial = GetComponent.<Renderer>().material;
   SetEnabled(colorIndex <= 4);
}

function OnMouseDown() {
   if (m_enabled)
      board.ProcessClick(colorIndex);
}

function SetEnabled(enabled : boolean) {
   m_enabled = enabled;
   if (enabled) {
      GetComponent.<Renderer>().material = ColorController.colorMaterials[colorIndex];
   } else {
      GetComponent.<Renderer>().material = defaultMaterial;
   }
}