//=============================================================================
// LoadingExtend.js
// ----------------------------------------------------------------------------
// 
// ----------------------------------------------------------------------------

//=============================================================================

/*:
 * @plugindesc LoadingExtendPlugin
 * 
 */

(function() {
    'use strict';
    var pluginName = 'LoadingExtend';

    //=============================================================================
    // 
    //=============================================================================
    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return '';
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamString(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamString(paramNames);
        return value.toUpperCase() === 'ON';
    };

    var getArgNumber = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg)) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {//出現可以更改的清單
        if (isNotAString(text)) text = '';
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    var isNotAString = function(args) {
        return String(args) !== args;
    };

    //=============================================================================
    // 
    //=============================================================================
    var param               = {};
    param.imageColumn       = getParamNumber(['ImageColumn', '列数'], 1);
    param.imageRow          = getParamNumber(['ImageRow', '行数'], 1);
    param.showingType       = getParamNumber(['ShowingType', '表示'], 0);
    param.animationInterval = getParamNumber(['AnimationInterval', '間隔'], 0);
    param.xPosition         = getParamString(['XPosition', '表示位置X座標']);
    param.yPosition         = getParamString(['YPosition', '表示位置Y座標']);
    param.waitingFrames     = getParamNumber(['WaitingFrames', '待機数'], 1) || 20;
    param.noFlashing        = getParamBoolean(['NoFlashing', '點滅']);

    //=============================================================================
    // Graphics
    //  
    //=============================================================================
    var _Graphics_initialize = Graphics.initialize;
    Graphics.initialize      = function(width, height, type) {
        _Graphics_initialize.apply(this, arguments);
        this._loadingPattern = 0;
    };

    var _Graphics_startLoading = Graphics.startLoading;
    Graphics.startLoading      = function() {
        _Graphics_startLoading.apply(this, arguments);
        if (param.showingType === 1) {
            this._loadingPattern = Math.randomInt(this._getLoadingImageAllCount());
        }
    };

    var _Graphics_updateLoading = Graphics.updateLoading;
    Graphics.updateLoading      = function() {
        _Graphics_updateLoading.apply(this, arguments);
        if (param.showingType === 2 && (this._loadingCount + 1) % param.animationInterval === 0) {
            this._loadingPattern = (this._loadingPattern + 1) % this._getLoadingImageAllCount();
        }
    };

    Graphics._getLoadingImageAllCount = function() {
        return param.imageColumn * param.imageRow;
    };

    Graphics._getLoadingImageWidth = function() {
        return this._loadingImage.width / param.imageColumn;
    };

    Graphics._getLoadingImageHeight = function() {
        return this._loadingImage.height / param.imageRow;
    };

    Graphics._getLoadingImageX = function() {
        return (this._loadingPattern % param.imageColumn) * this._getLoadingImageWidth();
    };

    Graphics._getLoadingImageY = function() {
        return Math.floor(this._loadingPattern / param.imageColumn) * this._getLoadingImageHeight();
    };

    Graphics._paintUpperCanvas = function() {
        this._clearUpperCanvas();
        if (this._loadingImage && this._loadingCount >= param.waitingFrames) {
            var context = this._upperCanvas.getContext('2d');
            var dw      = this._getLoadingImageWidth();
            var dh      = this._getLoadingImageHeight();
            var dx      = (param.xPosition !== '' ? getArgNumber(param.xPosition) : this._width / 2) - dw / 2;
            var dy      = (param.yPosition !== '' ? getArgNumber(param.yPosition) : this._height / 2) - dh / 2;
            context.save();
            if (!param.noFlashing) {
                context.globalAlpha = ((this._loadingCount - 20) / 30).clamp(0, 1);
            }
            var sx = this._getLoadingImageX();
            var sy = this._getLoadingImageY();
            context.drawImage(this._loadingImage, sx, sy, dw, dh, dx, dy, dw, dh);
            context.restore();
        }
    };
})();

