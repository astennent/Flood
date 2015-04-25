#pragma strict

var id : UnityEngine.UI.Text;
// TODO: Image for number of stars
var level : Level;
var page : int;
var index : int;

function SetStarsImage(stars : UnityEngine.Sprite) {
   var image = GetComponent.<UnityEngine.UI.Image>();
   image.sprite = stars;
}