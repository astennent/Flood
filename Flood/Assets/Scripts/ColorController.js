public static var colors = [
   Color.red,
   Color.green,
   Color.blue,
   Color.yellow,
   Color.cyan,
   Color.magenta,
   new Color(1, .4, 0) //orange
];

/* It is faster to store a list of pre-made materials and swap them out when needed than to create
   a new material every time a Tile is instantiated or flipped. So we store the list of all 
   usable colors as materials here, where the materials can be accessed quickly at runtime. */
public static var colorMaterials : List.<Material>;
public var tileMaterial : Material;

public static var s_instance : ColorController;

function Start() {
   s_instance = this;
   RefreshColorMaterials();
}

static function RefreshColorMaterials() {
   colorMaterials = new List.<Material>();
   for (var i = 0 ; i < colors.length ; i++) {
      colorMaterials.Add(new Material(s_instance.tileMaterial));
      colorMaterials[i].SetColor("_Color", colors[i]);
   }
}

public function SetColors(themeButton : ThemeButton) {
   colors = themeButton.colors;
   RefreshColorMaterials();
}