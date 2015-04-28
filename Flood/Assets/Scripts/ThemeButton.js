#pragma strict

var colorImages : UnityEngine.UI.Image[];
var colors : Color[];


function Start() {
   for (var i = 0 ; i < colorImages.length ; ++i) {
      colorImages[i].color = colors[i];
   }
}