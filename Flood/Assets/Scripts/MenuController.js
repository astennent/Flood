#pragma strict

var m_camera : FloodCamera;
var skin : GUISkin;
var skybox : Material;
var blockingBox : GameObject;
var board : Board;

// This order corresponds with the order of in m_menus
private static var MENU_NONE = -1;
private static var MENU_MAIN = 0;
private static var MENU_LEVEL_PACKS = 1;
private static var MENU_SELECTED_PACK = 2;
private static var MENU_SETTINGS = 3;
private static var MENU_ABOUT = 4;
var m_menus : UnityEngine.UI.Image[];

private var m_currentMenuIndex : int;
private var m_selectedPack : LevelPack;

private static var s_instance : MenuController;

function Start() {
   s_instance = this;
   for (var menu in m_menus) {
      menu.gameObject.SetActive(false);
   }
   SetMenu(MENU_MAIN);
}


function Update() {
   if (Input.GetKeyDown(KeyCode.Escape)) { 
      OnBackButtonPressed();
   }
}

function OnBackButtonPressed() {
   switch(m_currentMenuIndex) {
      case MENU_NONE:
         if (s_instance.board.GetLevel()) {
            s_instance.GetComponent.<LevelPackController>().RefreshLevelButtons();
            SetMenu(MENU_SELECTED_PACK);
         } else {
            SetMenu(MENU_MAIN);
         }
      break;
      case MENU_MAIN:
         Application.Quit();
      break;
      case MENU_LEVEL_PACKS:
         SetMenu(MENU_MAIN);
      break;
      case MENU_SELECTED_PACK:
         SetMenu(MENU_LEVEL_PACKS);
      break;
      case MENU_SETTINGS:
         SetMenu(MENU_MAIN);
      break;
      case MENU_ABOUT:
         SetMenu(MENU_MAIN);
      break;
   }
}

function SetMenu(menuIndex : int) {
   if (m_currentMenuIndex != MENU_NONE) {
      m_menus[m_currentMenuIndex].gameObject.SetActive(false);
   }

   m_currentMenuIndex = menuIndex;
   if (menuIndex != MENU_NONE) {
      var menu = m_menus[menuIndex];
      menu.gameObject.SetActive(true);
      blockingBox.SetActive(true);
   } 
   else {
      blockingBox.SetActive(false);
   } 
}

function OnClickZen() {
   s_instance.board.LoadZen();
   s_instance.SetMenu(MENU_NONE);
}

function OnClickLevelPack(levelPackButton : LevelPackButton) {
   s_instance.SetMenu(MENU_SELECTED_PACK);
   s_instance.GetComponent.<LevelPackController>().SelectLevelPack(levelPackButton.levelPack);
}

function OnClickLevel(levelButton : LevelButton) {
   s_instance.board.LoadLevel(levelButton.level);
   s_instance.SetMenu(MENU_NONE);
}