#pragma strict

var m_camera : FloodCamera;
var skin : GUISkin;

var skybox : Material;

var blockingBox : GameObject;

// This order corresponds with the order of in m_menus
private static var MENU_NONE = -1;
private static var MENU_MAIN = 0;
private static var MENU_LEVEL_PACKS = 1;
private static var MENU_SELECTED_PACK = 2;
private static var MENU_SETTINGS = 3;
private static var MENU_ABOUT = 4;
var m_menus : UnityEngine.UI.Image[];

private var m_currentMenu : UnityEngine.UI.Image;
private var m_selectedPack : LevelPack;

private static var s_instance : GameController;

function Start() {
   s_instance = this;
   for (var menu in m_menus) {
      menu.gameObject.SetActive(false);
   }
   SetMenu(MENU_MAIN);
}

function Update() {
   if (Input.GetKeyDown(KeyCode.Escape)) { 
      if (m_currentMenu == MENU_LEVEL_PACKS) { // add other screens here to go back.
         m_currentMenu = m_menus[MENU_MAIN];
      } else {
         Application.Quit();
      }
   }

   // todo: fade
   if (m_currentMenu != null) {
      blockingBox.SetActive(true);
   } else {
      blockingBox.SetActive(false);
   }

}

function SetMenu(menuIndex : int) {
   if (m_currentMenu) {
      m_currentMenu.gameObject.SetActive(false);
   }
   
   var menu : UnityEngine.UI.Image;
   if (menuIndex != -1) {
      Debug.Log(menuIndex);
      menu = m_menus[menuIndex];
      menu.gameObject.SetActive(true);
   }

   m_currentMenu = menu;
}

function OnClickLevelPack(levelPackButton : LevelPackButton) {
   s_instance.SetMenu(MENU_SELECTED_PACK);
   Debug.Log(levelPackButton.levelPack.title);
   s_instance.GetComponent.<LevelPackController>().SelectLevelPack(levelPackButton.levelPack);
}

function OnClickLevel(levelButton : LevelButton) {
   SetMenu(MENU_NONE);
   Debug.Log(levelButton.level);
   s_instance.GetComponent.<LevelPackController>().SelectLevel(levelButton.level);
}