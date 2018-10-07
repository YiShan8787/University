//-----------------------------------------------------------------------------
// Scene_Title
//
// The scene class of the title screen.

(function(){


function Scene_Title() {
    this.initialize.apply(this, arguments);
}

Scene_Title.prototype = Object.create(Scene_Base.prototype);
Scene_Title.prototype.constructor = Scene_Title;

Scene_Title.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_Title.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createForeground();
    this.createWindowLayer();
    this.createCommandWindow();
};

Scene_Title.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SceneManager.clearStack();
    this.centerSprite(this._backSprite1);
    this.centerSprite(this._backSprite2);
    this.playTitleMusic();
    this.startFadeIn(this.fadeSpeed(), false);
};

Scene_Title.prototype.update = function() {
    if (!this.isBusy()) {
        this._commandWindow.open();
    }
    Scene_Base.prototype.update.call(this);
};

Scene_Title.prototype.isBusy = function() {
    return this._commandWindow.isClosing() || Scene_Base.prototype.isBusy.call(this);
};

Scene_Title.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    SceneManager.snapForBackground();
};

Scene_Title.prototype.createBackground = function() {
    this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
    this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
    this.addChild(this._backSprite1);
    this.addChild(this._backSprite2);
};

Scene_Title.prototype.createForeground = function() {
    this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
    this.addChild(this._gameTitleSprite);
    if ($dataSystem.optDrawTitle) {
        this.drawGameTitle();
    }
};

Scene_Title.prototype.drawGameTitle = function() {
    var x = 20;
    var y = Graphics.height / 4;
    var maxWidth = Graphics.width - x * 2;
    var text = $dataSystem.gameTitle;
    this._gameTitleSprite.bitmap.outlineColor = 'black';
    this._gameTitleSprite.bitmap.outlineWidth = 8;
    this._gameTitleSprite.bitmap.fontSize = 72;
    this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
};

Scene_Title.prototype.centerSprite = function(sprite) {
    sprite.x = Graphics.width / 2;
    sprite.y = Graphics.height / 2;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
};

Scene_Title.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_TitleCommand();
    this._commandWindow.setHandler('newGame',  this.commandNewGame.bind(this));
    this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
	this._commandWindow.setHandler('Extra', this.commandExtra.bind(this));
    this._commandWindow.setHandler('options',  this.commandOptions.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Title.prototype.commandNewGame = function() {
    DataManager.setupNewGame();
    this._commandWindow.close();
    this.fadeOutAll();
    SceneManager.goto(Scene_Map);
};

Scene_Title.prototype.commandContinue = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Load);
};

Scene_Title.prototype.commandExtra = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Loadextra);
};

Scene_Title.prototype.commandOptions = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Options);
};

Scene_Title.prototype.playTitleMusic = function() {
    AudioManager.playBgm($dataSystem.titleBgm);
    AudioManager.stopBgs();
    AudioManager.stopMe();
};

//---------------------------------------------------


StorageManager.extralocalFilePath = function(savefileId) {
    var name;
    if (savefileId < 0) {
        name = 'config.rpgsave';
    } else if (savefileId === 0) {
        name = 'global.rpgsave';
    } else {
        name = 'file%1.rpgsave'.format(savefileId);
    }
    return this.extralocalFileDirectoryPath() + name;
};

StorageManager.extralocalFileDirectoryPath = function() {
    var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, '/extra/');
    if (path.match(/^\/([A-Z]\:)/)) {
        path = path.slice(1);
    }
    return decodeURIComponent(path);
};

StorageManager.extraloadFromLocalFile = function(savefileId) {
    var data = null;
    var fs = require('fs');
    var filePath = this.extralocalFilePath(savefileId);
    if (fs.existsSync(filePath)) {
        data = fs.readFileSync(filePath, { encoding: 'utf8' });
    }
    return LZString.decompressFromBase64(data);
};

StorageManager.extraload = function(savefileId) {
    
    return this.loadFromLocalFile(savefileId);
    
};
//-----------------------------------------------------------------------------
// extraScene_File
//
// The superclass of Scene_Save and Scene_Load.

function extraScene_File() {
    this.initialize.apply(this, arguments);
}

extraScene_File.prototype = Object.create(Scene_MenuBase.prototype);
extraScene_File.prototype.constructor = extraScene_File;

extraScene_File.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

extraScene_File.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    DataManager.extraloadAllSavefileImages();
    this.createHelpWindow();
    this.createListWindow();
};

extraScene_File.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._listWindow.refresh();
};

extraScene_File.prototype.savefileId = function() {
    return this._listWindow.index() + 1;
};

extraScene_File.prototype.createHelpWindow = function() {
    this._helpWindow = new Window_Help(1);
    this._helpWindow.setText(this.helpWindowText());
    this.addWindow(this._helpWindow);
};

extraScene_File.prototype.createListWindow = function() {
    var x = 0;
    var y = this._helpWindow.height;
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight - y;
    this._listWindow = new Window_extraSavefileList(x, y, width, height);
    this._listWindow.setHandler('ok',     this.onSavefileOk.bind(this));
    this._listWindow.setHandler('cancel', this.popScene.bind(this));
    this._listWindow.select(this.firstSavefileIndex());
    this._listWindow.setTopRow(this.firstSavefileIndex() - 2);
    this._listWindow.setMode(this.mode());
    this._listWindow.refresh();
    this.addWindow(this._listWindow);
};

extraScene_File.prototype.mode = function() {
    return null;
};

extraScene_File.prototype.activateListWindow = function() {
    this._listWindow.activate();
};

extraScene_File.prototype.helpWindowText = function() {
    return '';
};

extraScene_File.prototype.firstSavefileIndex = function() {
    return 0;
};

extraScene_File.prototype.onSavefileOk = function() {
};
//-----------------------------------------------------------------------------
// Window_extraSavefileList
//
// The window for selecting a save file on the save and load screens.

function Window_extraSavefileList() {
    this.initialize.apply(this, arguments);
}

Window_extraSavefileList.prototype = Object.create(Window_Selectable.prototype);
Window_extraSavefileList.prototype.constructor = Window_extraSavefileList;

Window_extraSavefileList.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.activate();
    this._mode = null;
};

Window_extraSavefileList.prototype.setMode = function(mode) {
    this._mode = mode;
};

Window_extraSavefileList.prototype.maxItems = function() {
    return DataManager.maxSavefiles();
};

Window_extraSavefileList.prototype.maxVisibleItems = function() {
    return 5;
};

Window_extraSavefileList.prototype.itemHeight = function() {
    var innerHeight = this.height - this.padding * 2;
    return Math.floor(innerHeight / this.maxVisibleItems());
};

Window_extraSavefileList.prototype.drawItem = function(index) {
    var id = index + 1;
    var valid = DataManager.extraisThisGameFile(id);
    var info = DataManager.extraloadSavefileInfo(id);
    var rect = this.itemRectForText(index);
    this.resetTextColor();
    if (this._mode === 'Extra') {
        this.changePaintOpacity(valid);
    }
    this.drawFileId(id, rect.x, rect.y);
    if (info) {
        this.changePaintOpacity(valid);
        this.drawContents(info, rect, valid);
        this.changePaintOpacity(true);
    }
};

Window_extraSavefileList.prototype.drawFileId = function(id, x, y) {
    this.drawText(TextManager.file + ' ' + id, x, y, 180);
};

Window_extraSavefileList.prototype.drawContents = function(info, rect, valid) {
    var bottom = rect.y + rect.height;
    if (rect.width >= 420) {
        this.drawGameTitle(info, rect.x + 192, rect.y, rect.width - 192);
        if (valid) {
            this.drawPartyCharacters(info, rect.x + 220, bottom - 4);
        }
    }
    var lineHeight = this.lineHeight();
    var y2 = bottom - lineHeight;
    if (y2 >= lineHeight) {
        this.drawPlaytime(info, rect.x, y2, rect.width);
    }
};

Window_extraSavefileList.prototype.drawGameTitle = function(info, x, y, width) {
    if (info.title) {
        this.drawText(info.title, x, y, width);
    }
};

Window_extraSavefileList.prototype.drawPartyCharacters = function(info, x, y) {
    if (info.characters) {
        for (var i = 0; i < info.characters.length; i++) {
            var data = info.characters[i];
            this.drawCharacter(data[0], data[1], x + i * 48, y);
        }
    }
};

Window_extraSavefileList.prototype.drawPlaytime = function(info, x, y, width) {
    if (info.playtime) {
        this.drawText(info.playtime, x, y, width, 'right');
    }
};

Window_extraSavefileList.prototype.playOkSound = function() {
};




//-----------------------------------------------------------------------------
// Scene_Loadextra
//
// The scene class of the load screen.

function Scene_Loadextra() {
    this.initialize.apply(this, arguments);
}

Scene_Loadextra.prototype = Object.create(extraScene_File.prototype);
Scene_Loadextra.prototype.constructor = Scene_Loadextra;

Scene_Loadextra.prototype.initialize = function() {
    extraScene_File.prototype.initialize.call(this);
    this._loadSuccess = false;
};

Scene_Loadextra.prototype.terminate = function() {
    extraScene_File.prototype.terminate.call(this);
    if (this._loadSuccess) {
        $gameSystem.onAfterLoad();
    }
};

Scene_Loadextra.prototype.mode = function() {
    return 'Extra';
};

Scene_Loadextra.prototype.helpWindowText = function() {
    return TextManager.loadMessage;
};

Scene_Loadextra.prototype.firstSavefileIndex = function() {
    return DataManager.extralatestSavefileId() - 1;
};

Scene_Loadextra.prototype.onSavefileOk = function() {
    extraScene_File.prototype.onSavefileOk.call(this);
    if (DataManager.loadGameextra(this.savefileId())) {
        this.onLoadSuccess();
    } else {
        this.onLoadFailure();
    }
};

Scene_Loadextra.prototype.onLoadSuccess = function() {
    SoundManager.playLoad();
    this.fadeOutAll();
    this.reloadMapIfUpdated();
    SceneManager.goto(Scene_Map);
    this._loadSuccess = true;
};

Scene_Loadextra.prototype.onLoadFailure = function() {
    SoundManager.playBuzzer();
    this.activateListWindow();
};

Scene_Loadextra.prototype.reloadMapIfUpdated = function() {
    if ($gameSystem.versionId() !== $dataSystem.versionId) {
        $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
        $gamePlayer.requestMapReload();
    }
};


//----------------------------------------------------------------

DataManager.loadGameextra = function(savefileId) {
    try {
        return this.loadGameextraWithoutRescue(savefileId);
    } catch (e) {
        console.error(e);
        return false;
    }
};

DataManager.loadGameextraWithoutRescue = function(savefileId) {
    var globalInfo = this.extraloadGlobalInfo();
    if (this.extraisThisGameFile(savefileId)) {
        var json = StorageManager.extraload(savefileId);
        this.createGameObjects();
        this.extractSaveContents(JsonEx.parse(json));
        this._lastAccessedId = savefileId;
        return true;
    } else {
        return false;
    }
};

DataManager.extraloadSavefileInfo = function(savefileId) {
    var globalInfo = this.extraloadGlobalInfo();
    return (globalInfo && globalInfo[savefileId]) ? globalInfo[savefileId] : null;
};

DataManager.extraisThisGameFile = function(savefileId) {
    var globalInfo = this.extraloadGlobalInfo();
    if (globalInfo && globalInfo[savefileId]) {
            return true;
    } else {
        return false;
    }
};

//----------------------------------------------------------------


Window_TitleCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame,   'newGame');
    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
	//this.addCommand('Extra', 'Extra', this.isextraContinueEnabled());
    this.addCommand(TextManager.options,   'options');
};

Window_TitleCommand.prototype.isextraContinueEnabled = function() {
    return DataManager.isAnyExtrafileExists();
};

Window_TitleCommand.prototype.processOk = function() {
    Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
    Window_Command.prototype.processOk.call(this);
};

Window_TitleCommand.prototype.selectLast = function() {
    if (Window_TitleCommand._lastCommandSymbol) {
        this.selectSymbol(Window_TitleCommand._lastCommandSymbol);
    } else if (this.isContinueEnabled()) {
        this.selectSymbol('continue');
    } else if (this.isextraContinueEnabled()) {
        this.selectSymbol('Extra');
    }
	
};



DataManager.isAnyExtrafileExists = function() {
    var globalInfo = this.extraloadGlobalInfo();
    if (globalInfo) {
        for (var i = 1; i < globalInfo.length; i++) {
            if (this.extraisThisGameFile(i)) {
                return true;
            }
        }
    }
    return false;
};

DataManager.extralatestSavefileId = function() {
    var globalInfo = this.extraloadGlobalInfo();
    var savefileId = 1;
    var timestamp = 0;
    if (globalInfo) {
        for (var i = 1; i < globalInfo.length; i++) {
            if (this.extraisThisGameFile(i) && globalInfo[i].timestamp > timestamp) {
                timestamp = globalInfo[i].timestamp;
                savefileId = i;
            }
        }
    }
    return savefileId;
};


DataManager.extraloadGlobalInfo = function() {
    var json;
    try {
        json = StorageManager.extraload(0);
    } catch (e) {
        console.error(e);
        return [];
    }
    if (json) {
        var globalInfo = JSON.parse(json);
        for (var i = 1; i <= this.maxSavefiles(); i++) {
            if (!StorageManager.extraexists(i)) {
                delete globalInfo[i];
            }
        }
        return globalInfo;
    } else {
        return [];
    }
};

DataManager.extraloadAllSavefileImages = function() {
    var globalInfo = this.extraloadGlobalInfo();
    if (globalInfo) {
        for (var i = 1; i < globalInfo.length; i++) {
            if (this.extraisThisGameFile(i)) {
                var info = globalInfo[i];
                this.loadSavefileImages(info);
            }
        }
    }
};

StorageManager.extraexists = function(savefileId) {
    
    return this.extralocalFileExists(savefileId);
    
};

StorageManager.extralocalFileExists = function(savefileId) {
    var fs = require('fs');
    return fs.existsSync(this.extralocalFilePath(savefileId));
};

//---------------------test

//選項菜單視窗：只使用聲音功能
    Window_Options.prototype.makeCommandList = function() {
        //this.addGeneralOptions();
        this.addVolumeOptions();
        this.addNewFeatures();
    };

    //選項菜單視窗：新增選項功能
    Window_Options.prototype.addNewFeatures = function(){
        this.addCommand( '載入進度', 'load' );
        this.addCommand( '連結官網', 'extra' );
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
            SceneManager.push( Scene_Loadextra );
        
        //連結官網
        }else if( symbol == 'extra' ){

            window.open( 'https://app.siako.mobi' );
			//SceneManager.push( Scene_Loadextra );

        }
    };




})();