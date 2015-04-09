#pragma strict

var m_camera : FloodCamera;
var skin : GUISkin;

var skybox : Material;

var blockingBox : GameObject;

private var m_menuToggleTime : float = -1;


// This order corresponds with the order of in m_menus
private var MENU_NONE = -1;
private var MENU_MAIN = 0;
private var MENU_LEVEL_PACKS = 1;
private var MENU_SELECTED_PACK = 2;
private var MENU_SETTINGS = 3;
private var MENU_ABOUT = 4;
var m_menus : UnityEngine.UI.Image[];
private var m_currentMenu : UnityEngine.UI.Image;

private var m_scrollPositionLevelPacks = Vector2.zero;

function Start() {
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
      menu = m_menus[menuIndex];
      menu.gameObject.SetActive(true);
   }

   m_currentMenu = menu;
}

function StartMenu() {
   m_menuToggleTime = Time.time;
}

function EndMenu() {
   m_menuToggleTime = Time.time;
}

