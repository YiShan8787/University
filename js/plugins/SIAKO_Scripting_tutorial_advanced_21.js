//======================================================
/*:
* @plugindesc Tutorial Advanced 21：選項菜單調整與新增功能
* - SIAKO.Mobi RMMV Plugin Scripting 教學
* 
* @author siakoMobi 
*
*/
//======================================================

/* 
 @ features : Tutorial Advanced 21
 @ comment  : 21：選項菜單調整與新增功能

1. 使用原生程式 rpg_windows.js -> Window_Options 框架
2. 使用原生程式 rpg_scenes.js -> Scene_Options 框架

*/



(function(){

    //==================================================================================
    // comment  : 插件參數定義
    //==================================================================================    
    


    //選項菜單視窗：只使用聲音功能
    Window_Options.prototype.makeCommandList = function() {
        //this.addGeneralOptions();
        this.addVolumeOptions();
        this.addNewFeatures();
    };

    //選項菜單視窗：新增選項功能
    Window_Options.prototype.addNewFeatures = function(){
        this.addCommand( '載入進度', 'load' );
        this.addCommand( '連結官網', 'web' );
    }

    // Window_Options.prototype.windowWidth = function() {
    //     return 800;
    // };

    // Window_Options.prototype.windowHeight = function() {
    //     return 300;
    // };

    //選項菜單視窗：調整視窗內文字大小或顏色
    Window_Options.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var titleWidth = rect.width - statusWidth;
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));

        this.contents.fontSize = 15;
        this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left');
        this.changeTextColor(this.textColor(14));
        this.drawText(this.statusText(index), titleWidth, rect.y, statusWidth, 'right');
        this.resetTextColor();
        this.contents.fontSize = 24;

    };

    //選項菜單視窗：只保留聲音的調節文字
    Window_Options.prototype.statusText = function(index) {
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if (this.isVolumeSymbol(symbol)) {
            return this.volumeStatusText(value);
        }
    };  

    //選項菜單視窗：新增綁定選項功能
    Window_Options.prototype.processOk = function() {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);

        //聲音處理
        if (this.isVolumeSymbol(symbol)) {
            value += this.volumeOffset();
            if (value > 100) {
                value = 0;
            }
            value = value.clamp(0, 100);
            this.changeValue(symbol, value);

        //載入進度
        }else if( symbol == 'load' ){

            SoundManager.playOk();
            SceneManager.push( Scene_Load );
        
        //連結官網
        }else if( symbol == 'web' ){

            window.open( 'https://app.siako.mobi' );

        }
    };

    //選項菜單場景：建立選項菜單背景
    /*Scene_Options.prototype.create = function() {
        
        Scene_MenuBase.prototype.create.call(this);

        this._optionsBG = new Sprite( ImageManager.loadTitle1( 'siakoMobi_FinalFantasy_optionsBG' ) );
        this._optionsBG.x = Graphics.boxWidth / 2 - 200;
        this._optionsBG.y = Graphics.boxHeight / 2 - 125;
        this.addChild( this._optionsBG );
        this.createOptionsWindow();
    };

    //選項菜單場景：以別名擴充選項菜單場景框架的建立選項視窗類別
    siakoMobi.Alias_TA21 = Scene_Options.prototype.createOptionsWindow;
    Scene_Options.prototype.createOptionsWindow = function() {

        siakoMobi.Alias_TA21.call(this);

        //將選項視窗全透明
        this._optionsWindow.opacity = 0;
        this.addChild(this._optionsWindow);
    };*/

})();