'use strict';
/*****************************
 * Copyright (c) 2016 by Alexander Hramov
 * Licensed under MIT
 */

angular.module('ngColorThis', []).provider('tsColor', function () {
    var saturation = 0.8;
    var value = 0.7;
    this.setSaturation = function (s) {
        saturation = s;
    };

    this.setValue = function (v) {
        value = v;
    };

    this.$get = function () {
        function fnv32a(str) {
            var FNV1_32A_INIT = 0x811c9dc5;
            var hval = FNV1_32A_INIT;
            for (var i = 0; i < str.length; ++i) {
                hval ^= str.charCodeAt(i);
                hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
            }
            return hval >>> 0;
        }

        function hsvToRgb(h, s, v) {
            if (s === 0) {
                // achromatic (grey)
                return '#000';
            }
            h /= 60;
            var i = Math.floor(h);
            var f = h - i;
            var p = Math.round(v * (1 - s) * 255);
            var q = Math.round(v * (1 - s * f) * 255);
            var t = Math.round(v * (1 - s * ( 1 - f )) * 255);
            v = Math.round(v * 255);
            switch (i) {
                case 0:
                    return {red: v, green: t, blue: p};
                case 1:
                    return {red: q, green: v, blue: p};
                case 2:
                    return {red: p, green: v, blue: t};
                case 3:
                    return {red: p, green: q, blue: v};
                case 4:
                    return {red: t, green: p, blue: v};
                default:        // case 5:
                    return {red: v, green: p, blue: q};
            }
        }

        function convert(str) {
            var shortHash = fnv32a(str) % 4096;
            var hue = (shortHash / 4096) * 360;
            return hsvToRgb(hue, saturation, value);
        }

        function getContrastColor(red, green, blue) {
            var y = red * 299 + green * 587 + blue * 114;
            return y >= 128000 ? '#000000' : '#FFFFFF';
        }

        function rgbToCSS(red, green, blue) {
          return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        }

        return {
            convert: convert,
            getContrastColor: getContrastColor,
            rgbToCSS: rgbToCSS
        };
    };

}).directive('colorThis', ["tsColor", function (Color) {
    return {
        restrict: 'A',
        scope: {
            color: '='
        },
        link: function (scope, element, attrs) {
            scope.$watch('color', function (newValue) {
                if (newValue) {
                    var rgb = Color.convert(newValue);
                    var css = Color.rgbToCSS(rgb.red, rgb.green, rgb.blue);
                    element.css(attrs.colorThis, css);
                    if (attrs.contrastColor) {
                        element.css(attrs.contrastColor, Color.getContrastColor(rgb.red, rgb.green, rgb.blue));
                    }
                }
            }, true);
        }
    };
  }]);
