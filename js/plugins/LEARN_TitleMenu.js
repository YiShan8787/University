//-----------------------------------------------------------------------------
// Scene_Title
//
// The scene class of the title screen.

(function(){

/*
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
};*/

//---------------------test

	DataManager.loadGallery = function(savefileId) 
	    {
	    	//SceneManager.push(Scene_Load);

	            try {
	            return this.loadGalleryWithoutRescue(savefileId);
	        } catch (e) {
	            console.error(e);
	            return false;
	        }
			        
		        Scene_Load.onLoadSuccess();
		        Scene_Load.terminate();

		      
	    }

	DataManager.loadGalleryWithoutRescue = function(savefileId)
	{
				var g = "NoOwrgNhA0DeBEBzCB7ARgQwgSQCbwC54AlABQHEBZANXmngBcBLBiAU0PgFUQmA3NgCcAziwCegRldABvKBK50DbaoBc9OvADGACwyCMKhkOGFgweABIADKYCMdUwF0b9AGba2+gofgAOANQBOa3foABwgMMWYAWw4icwIYiw9lCJcGDHDAwgsAVgAWADZTDwtcnwBmAHYfHwBfGyAAAA==";
				var d = "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";
	            var globalInfo = LZString.decompressFromBase64(g);
	            //console.log(globalInfo);
	            localStorage.setItem('RPG File1',d);
	            localStorage.setItem('RPG Global',g);
	        	javascript:window.location.reload();
	            var json = LZString.decompressFromBase64(d);
	            //console.log(json);
	            this.createGameObjects();
	            this.extractSaveContents(JsonEx.parse(json));
	            this._lastAccessedId = savefileId;
	            return true;
	        
	}




    var _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function () {
        _Window_TitleCommand_makeCommandList.call(this);

        this.addCommand("特典", 'Gallery');//增加一个新菜单， Gallery
    };

    var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);

        this._commandWindow.setHandler('Gallery', this.commandGallery.bind(this)); //将标识符为homepage的菜单绑定到commandHomepage方法
    };

    Scene_Title.prototype.commandGallery = function() {
        this._commandWindow.activate();
        
        var pass=window.prompt("請輸入密碼");
        if(pass=="0000")
        {
            DataManager.loadGallery("1");//輸入檔名
        }
        else{
            return;
        }
    };


    StorageManager.prototype.loadFromLocalFile = function(savefileId) {
    var data = null;
    var fs = require('fs');
    var filePath = this.localFilePath(savefileId);
    if (fs.existsSync(filePath)) {
        data = fs.readFileSync(filePath, { encoding: 'utf8' });
    }
    return LZString.decompressFromBase64(data);
};


    

})();