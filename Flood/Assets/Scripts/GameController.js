var m_camera : FloodCamera;
var skin : GUISkin;

var skybox : Material;

private var m_isMenuActive : boolean = false;
private var m_menuToggleTime : float = -1;

private var m_currentMenu : int = 0;
var MAIN_MENU = 0;
var LEVEL_PACKS = 1;


// This doesn't really go on the camera, but I don't want to make a GameController.
function Update() {
   if (Input.GetKeyDown(KeyCode.Escape)) { 
      if (m_isMenuActive) {
         if (m_currentMenu == LEVEL_PACKS) { // add other screens here to go back.
            m_currentMenu = MAIN_MENU;
         } else {
            Application.Quit();
         }
      } else {
         StartMenu();
      }
   }

   // skybox.SetFloat("_Rotation", 3*Time.time);
}

function StartMenu() {
   m_isMenuActive = true;
   m_menuToggleTime = Time.time;
}

function EndMenu() {
   m_isMenuActive = false;
   m_menuToggleTime = Time.time;
}

function OnGUI() {
   GUI.skin = skin;

   DrawFadingBackgroundRect();
   
   if (!m_isMenuActive) {
      return;
   }

   var cur_y = DrawTitle();
   DrawMainMenu(cur_y);
}

private function DrawFadingBackgroundRect() {
   var backgroundRect = new Rect(0, 0, Screen.width, Screen.height);

   var MAX_ALPHA = 1.0;
   var FADE_TIME = 0.25;
   var elapsedTime = Time.time - m_menuToggleTime;
   if (elapsedTime < FADE_TIME) {
      var alpha = elapsedTime / FADE_TIME * MAX_ALPHA;

      if (!m_isMenuActive) {
         alpha = MAX_ALPHA - alpha;
      }

      GUI.color.a = alpha;
      GUI.Box(backgroundRect, "");
   } else if (m_isMenuActive) {
      GUI.color.a = MAX_ALPHA;
      GUI.Box(backgroundRect, "");
   }

}

private function DrawTitle() {

   var labelWidth = Screen.width;
   var labelHeight = Mathf.Min(200, Screen.height/6);
   var titleRect = new Rect(0, labelHeight/2, labelWidth, labelHeight);

   var oldFontSize = GUI.skin.label.fontSize;
   GUI.skin.label.fontSize = 70;
   GUI.Label(titleRect, "Flood");
   GUI.skin.label.fontSize = oldFontSize;
   return titleRect.yMax;
}

private function DrawMainMenu(cur_y : int) {
   var buttonWidth = Mathf.Min(300, Screen.width / 2);
   var buttonHeight = buttonWidth * 1/4;
   var buttonLeft = (Screen.width - buttonWidth)/2;
   var buttonPadding = buttonHeight/2;
   var buttonRect = new Rect(buttonLeft, cur_y+buttonPadding, buttonWidth, buttonHeight);

   if (GUI.Button(buttonRect, "Zen")) {
      EndMenu();
   }
   buttonRect.y += buttonHeight+buttonPadding;

   if (GUI.Button(buttonRect, "Levels")) {
      m_isMenuActive = false;
   }
   buttonRect.y += buttonHeight+2*buttonPadding;

   if (GUI.Button(buttonRect, "Settings")) {
      m_isMenuActive = false;
   }
   buttonRect.y += buttonHeight+buttonPadding;

   if (GUI.Button(buttonRect, "About")) {
      m_isMenuActive = false;
   }
   buttonRect.y += buttonHeight+buttonPadding;

   // Zen, Free Play, Settings, About

}