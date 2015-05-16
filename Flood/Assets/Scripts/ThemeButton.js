#pragma strict

var colorImages : UnityEngine.UI.Image[];
var colors : Color[];
var material : Material;

static var selectedColor = Color.white;
static var unselectedColor = new Color(.85, .85, .85);

function Start() {
   for (var i = 0 ; i < colorImages.length ; ++i) {
      colorImages[i].color = colors[i];
   }
}

function SetSelected(isSelected : boolean) {
   GetComponent.<UnityEngine.UI.Image>().color = (isSelected) ? selectedColor : unselectedColor;
}