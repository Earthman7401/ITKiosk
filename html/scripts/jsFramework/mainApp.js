var testFlag = {
    isHTMLVerision: false,
    isOffLine: true,
    offScanner: true,
    viewDebugger: true,
}
var kiosk = kiosk || {};
(function() {
    kiosk.API = kiosk.API || {};
    kiosk.culture = kiosk.culture || kiosk.enum.culture.ENUS;
    kiosk.enum = kiosk.enum || {};
    kiosk.keepProcessTime = 3;
    kiosk.status = {};
    kiosk.API.transferEnum = function(enumType) {
        var wt = {}
        $.each(enumType, function(key, val) {
            wt[wt[key] = val] = key;
        });
        return wt;
    };
    $.each(kiosk.enum, function(key, obj) {
        obj = kiosk.API.transferEnum(obj);
    });
    kiosk.API.loadError = function(el) {
        //console.log($(el.target).attr('src'));
        $(el.target).attr("src", "img/ITSLogo.jpg");
    }

    kiosk.API.Device = kiosk.API.Device || {};
    kiosk.API.Device.Scanner = {
        generuteParemater: function(action, regex, fliePath, retryDelay) {
            var scannerCmd = {
                    regex: regex || '',
                    fliePath: fliePath || '',
                    RetryDelay: retryDelay || 300
                },
                actionCmd = {
                    Action: action,
                    Paremater: JSON.stringify(scannerCmd)
                },
                cmd = {
                    "DeviceName": "Scanner",
                    "Worktype": "PostRequest",
                    "Paremater": JSON.stringify(actionCmd),
                    "ReponseModule": "UI",
                };
            return cmd;
        },
        startScanner: function(regex, callback) {
            var self = this;
            if (testFlag.offScanner) {
                setTimeout(function() {
                    callback({ IsSuccess: true, Result: '55485445521588' });
                }, 3000)
            } else {
                kiosk.API.Device.postToDeviceWithCallback(JSON.stringify(self.generuteParemater("ScanningBarCode", regex)),
                    function(res) { callback(JSON.parse(res)); });
            }

        },
        stopScanner: function() {
            var self = this;
            if (!testFlag.offScanner)
                kiosk.API.Device.sendToDevice(JSON.stringify(this.generuteParemater("Close")));
        },
        openScanner: function() {
            if (!testFlag.offScanner)
                kiosk.API.Device.sendToDevice(JSON.stringify(this.generuteParemater("Open")));
        },
        resetScanner: function() {
            if (!testFlag.offScanner)
                kiosk.API.Device.sendToDevice(JSON.stringify(this.generuteParemater("Reset")));
        }
    };
    kiosk.API.Device.Thermal = {
        setAttr: function(tag, el) {
            if (el.attributes) {
                $.each(el.attributes, function(index, attr) {
                    tag.Attubites[attr.name] = attr.value;
                });
            }
        },
        TagModel: {
            THERMAL_CUTPAGE: function(el) {
                return { Type: el.localName };
            },
            THERMAL_TEXT: function(el) {
                var self = this,
                    tag = {
                        Attubites: {
                            height: 1,
                            width: 1,
                            wide_character: 1,
                            bold: false,
                            tab: 0,
                            underline: false,
                            alignment: 'left'
                        },
                        InnerText: el.textContent,
                        Type: el.localName
                    };
                kiosk.API.Device.Thermal.setAttr(tag, el);
                return tag;
            },
            THERMAL_BITMAP: function(el) {
                var tag = {
                    Attubites: {
                        file: '',
                        size: 0,
                        alignment: 'left'
                    },
                    InnerText: el.textContent,
                    Type: el.localName
                };
                kiosk.API.Device.Thermal.setAttr(tag, el);
                return tag;
            },
            THERMAL_BARCODE: function(el) {
                var tag = {
                    Attubites: {
                        size: 50,
                        position: 'below',
                        code_type: 'Code128',
                        alignment: 'left'
                    },
                    InnerText: el.textContent,
                    Type: el.localName
                };
                kiosk.API.Device.Thermal.setAttr(tag, el);
                return tag;
            },
            THERMAL_QRCODE: function(el) {
                var tag = {
                    Attubites: {
                        size: 50,
                        alignment: 'left'
                    },
                    InnerText: el.textContent,
                    Type: el.localName
                };
                kiosk.API.Device.Thermal.setAttr(tag, el);
                return tag;
            },
            THERMAL_SUBCONTENT: function(el) {
                var tag = {
                    Attubites: {
                        datasource: ''
                    },
                    child: [],
                    Type: el.localName
                };
                kiosk.API.Device.Thermal.setAttr(tag, el);

                $.each(el.childNodes, function(key, child) {
                    if (child.nodeType == 1) {
                        tag.child.push(kiosk.API.Device.Thermal.TagModel[child.tagName](child));
                    }
                });
                return tag;
            },
        },
        receiptTemplate: undefined,
        generateTemplate: function(xmltxt) {
            var self = {};
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmltxt, "text/xml");
            $.each(xmlDoc.getElementsByTagName('THERMAL_PRINT'), function(key, type) {
                self[type.getAttribute('id').toLowerCase()] = [];
                $.each(type.getElementsByTagName('THERMAL_PAGE'), function(key, page) {
                    var pageModel = {
                        tags: [],
                        rotation: 'normal',
                    };

                    if (page.getAttribute('rotation')) {
                        pageModel.rotation = page.getAttribute('rotation');
                    }
                    if (page.getAttribute('loop-for')) {
                        pageModel.loopfor = page.getAttribute('loop-for');
                    }
                    $.each(page.childNodes, function(key, child) {
                        try {
                            pageModel.tags
                                .push(new kiosk.API.Device.Thermal.TagModel[child.tagName](child));
                        } catch (e) {
                            //console.log(child.tagName);
                            //console.log(child);
                        }
                    });
                    pageModel.tags.push(new kiosk.API.Device.Thermal.TagModel.THERMAL_TEXT({
                        textContent: '',
                        localName: 'THERMAL_TEXT'
                    }));
                    self[type.getAttribute('id').toLowerCase()].push(pageModel);
                });
            });
            return self;
        },
        generuteParemater: function(action, content, workType) {
            var deviceCmd = {
                    Content: content.content || '',
                    Size: content.Size || "0",
                    Alignment: content.Alignment || "",
                    Position: content.Position || "",
                    CodeType: content.CodeType || ""
                },
                actionCmd = {
                    Action: action,
                    Paremater: JSON.stringify(deviceCmd)
                },
                cmd = {
                    "DeviceName": "Thermal",
                    "Worktype": workType || "PostRequest",
                    "Paremater": JSON.stringify(actionCmd),
                    "ReponseModule": "UI",
                };
            return cmd;
        },
        parseSubContent: function(subTag, subData) {
            var tags = [];
            $.each(subData, function(key, obj) {
                $.each(subTag.child, function(k, tag) {
                    var tagTemp = $.extend(true, {}, tag);
                    if (tagTemp.Type != 'THERMAL_SUBCONTENT') {
                        if (tagTemp.Type != 'THERMAL_CUTPAGE') {
                            var isNull = false;
                            tagTemp.InnerText = tagTemp.InnerText.replace(/\{\{(.*?)\}\}/g, function(match, token) {
                                if (obj[token])
                                    return obj[token];
                                isNull = true;
                                return '';
                            });
                            if (!isNull) {
                                tags.push(tagTemp);
                            }
                        } else {
                            tags.push(tagTemp);
                        }
                    } else {
                        global.API.concat(tags, self.parseSubContent(tagTemp, data[tagTemp.Attubites.datasource]));
                    }
                });
            });
            return tags
        },
        Open: function() {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("Open")));
        },
        CutPaper: function() {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("CutPaper", { content: 0 })));
        },
        PrintText: function(text) {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("PrintText", { content: text })));
        },
        PrintBitmap: function(filePath, size, alignment) {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("PrintBitmap"), {
                Content: filePath,
                Size: size || 229,
                Alignment: alignment || 'Center',
            }));
        },
        PrintBarCode: function(code, size, alignment, position, codeType) {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("PrintBarCode"), {
                Content: code,
                Size: size || 80,
                Alignment: alignment || 'Center',
                Position: position || 'Below',
                CodeType: codeType || 'Code128'
            }));
        },
        PrintQRCode: function(code, size, alignment, position) {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("PrintQRCode"), {
                Content: code,
                Size: size || 150,
                Alignment: alignment || 'Center',
                Position: position || 'Below',
            }));
        },
        CheckNearEnd: function() {
            return kiosk.API.Device.sendToDevice(JSON.stringify(this.generuteParemater("CheckNearEnd", {}, 'SendRequest')));
        },
        parsePage: function(tags, data) {
            var pageTags = [];
            $.each(tags, function(k, tag) {
                var isNull = true,
                    isReplase = false;
                if (tag.Type != 'THERMAL_SUBCONTENT') {
                    tag.InnerText = tag.InnerText.replace(/\{\{(.*?)\}\}/g, function(match, token) {
                        isReplase = true;
                        if (data[token]) {
                            isNull = false;
                            return data[token];
                        } else {
                            isNull = isNull && true;
                        }
                        return '';
                    });
                    if (!isNull || !isReplase) {
                        pageTags.push(tag);
                    }
                } else {
                    var childsTag = self.parseSubContent(tag, data[tag.Attubites.datasource]);
                    kiosk.API.concat(pageTags, childsTag);
                }
            });
            return pageTags;
        },
        PrintTemplatePage: function(receiptType, data) {
            if (testFlag.isHTMLVerision) {
                return;
            }
            var self = this;
            if (!self.receiptTemplate) {
                self.GetTemplate();
            }
            receiptType=receiptType.toLowerCase();
            //示範資料
            data = {                
                id: '0695',
                name: 'fake DigitalPin',
                price: 100,               
            };

            var pageTemplate = $.extend(true, {}, self.receiptTemplate[receiptType]);
            $.each(pageTemplate, function(key, page) {
                var np = $.extend(true, {}, page);
                var cmd = self.generuteParemater("PrintTemplatePage", {
                    content: JSON.stringify([{
                        tags: self.parsePage(np.tags, data),
                        rotation: page.rotation
                    }])
                });
                kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(cmd));
            })
        },
        GetTemplate: function() {
            var self = this;
            if (testFlag.viewDebugger) {
                var result = {
                    "IsSuccess": "true",
                    "IsNearEnd": "false",
                    "Result": "\r\n\r\n<THERMAL_TEMPLATE>\r\n\t<THERMAL_PRINT id=\"DigitalPin\">\r\n\t\t<THERMAL_PAGE>\t\t\t\r\n\t\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\t\t\t\t\t\t\t\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\r\n\t<THERMAL_PRINT id=\"InstantTopup\">\r\n\t\t<THERMAL_PAGE>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\r\n\t<THERMAL_PRINT id=\"BillPayment\">\r\n\t\t<THERMAL_PAGE>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\t\r\n</THERMAL_TEMPLATE>",
                    "Error": null
                }
            } else {
                var xmlStr = kiosk.API.Device.sendToDevice(JSON.stringify(this.generuteParemater("GetTemplateXML", {})));
                var result = JSON.parse(xmlStr);
            }
            var xmltxt = result.Result;
            self.receiptTemplate = self.generateTemplate(xmltxt);
        }
    };

    kiosk.API.goToNext = function (nextModelKey) {
        kiosk.API.resetTimmer();
        kiosk.currentModelKey = kiosk.currentModelKey || 'mainMenu';

        if (nextModelKey === 'mainMenu' && kiosk.session)
            kiosk.session.endSession();

        if (kiosk.session == undefined)
            kiosk.API.createSession();

        var behaviorData = {
            fronPageName: kiosk.currentModelKey,
            destination: nextModelKey,
            occurrenceTime: new Date()
        };

        $.extend(behaviorData, kiosk.status.currentModel);
        kiosk.session.addBehavior(behaviorData);

        if (nextModelKey) {
            if (kiosk.currentModelKey != nextModelKey)
                kiosk.lastModelKey = kiosk.currentModelKey;
            kiosk.currentModelKey = nextModelKey;
            var nextModel = viewModel[kiosk.culture][kiosk.currentModelKey],
                template = kiosk.currentModelKey.split('-')[0];

            kiosk.app.currentPage = 'component-' + template + '-main';
            kiosk.app.currentModel = nextModel;
            if (nextModel.bottom) {
                kiosk.app.currentFoot = 'component-' + template + '-foot';

            } else {
                kiosk.app.currentFoot = undefined;
            }
            if (nextModel.navBar) {
                kiosk.app.currentNavBar = 'component-' + template + '-navBar';
            } else {
                kiosk.app.currentNavBar = undefined;
            }
        } else {
            kiosk.app.currentModel = viewModel[kiosk.culture][kiosk.currentModelKey];
        }
        Vue.nextTick(function() {
            $('a').attr('draggable', false);
            $('img').attr('draggable', false);
            $('img').on("error", function() {
                $(this).attr("src", "img/ITSLogo.jpg");
            })
        });

    };
    kiosk.API.changeCulture = function (culture) {
        kiosk.culture = culture;
        kiosk.API.goToNext();
    };
    kiosk.API.initStatus = function() {
        kiosk.status = {};
    }
    kiosk.API.defautClick = function(e) {
        //console.log({
        //    html: e.target.outerHTML,
        //    currentViewModel: kiosk.currentModelKey
        //});
    };
    kiosk.API.goHome = function(e) {
        if (kiosk.session)
            kiosk.session.endSession();
        location.reload();
        $(e.target).prop("disabled", true);
    }
    kiosk.API.createSession = function() {
        var session = {};
        session.track = [];
        session.startTime = new Date();
        session.addBehavior = function(behaviorData) {
            this.track.push(behaviorData);
        };
        session.endSession = function() {
            var behaviors = this.track,
                startDate = this.startTime,
                endDate = new Date();
            if (behaviors.length == 0)
                return;
            $.each(behaviors, function(index, bev) {
                var behaviorData = $.extend(bev, { seqNo: index, startDate: startDate, endDate: endDate });
                try {
                    kiosk.API.log.logUserBehavior(behaviorData);
                } catch (e) {}

            });
            kiosk.session = undefined;
        }
        if (kiosk.session)
            kiosk.session.endSession();
        kiosk.session = session;
    }
    kiosk.API.resetTimmer = function() {
        kiosk.gobackToMainMenu = false;
    };

    kiosk.API.Timmer = function() {
        if (kiosk.currentModelKey === 'mainMenu')
            return;
        if (kiosk.gobackToMainMenu) {
            console.log('idle retun');
            kiosk.API.goToNext('mainMenu');
        } else
            kiosk.gobackToMainMenu = true;
    };
    kiosk.gobackToMainMenu = false;


    var templateContainer = $('<div></div>'),
        $body = $('body'),
        max = kioskTemplates.length,
        templateComplite = {};

    var loadTemplate = function(index) {
        var templateName = kioskTemplates[index],
            currentContainer = {},
            templateUrl = 'templates/' + templateName + '.html',
            componentUrl = 'scripts/components/' + templateName + '.js';

        templateComplite[templateName] = currentContainer;
        //  console.log(templateUrl + ':start');
        templateContainer.load(templateUrl, function(res) {
            //      console.log(templateUrl + ':done');
            $(res).appendTo($body);
            currentContainer.template = true;
            //      console.log(componentUrl + ':start');
            $.getScript(componentUrl, function(res) {
                currentContainer.component = true;
                //           console.log(componentUrl + ':done');
                startMain();
            });

            index++;
            if (index < max) {
                loadTemplate(index);
            } else {
                startMain();
            }
        });
    };
    var loadCulture = function() {
        var $body = $('body');
        temp = [];


    };



    var StartMainApp = function() {
        //    console.log('StartMainApp');
        var mainApp = new Vue({
            el: '#vpp',
            data: {
                currentCulture: kiosk.culture,
                currentPage: 'component-mainMenu-main',
                currentModel: viewModel[kiosk.culture]['mainMenu'],
                currentNavBar: 'component-mainMenu-navBar',
                currentFoot: undefined,
            },

            method: {
                updateNav: function (componentName, conponentModel) {
                    currentNavBar = componentName;
                    viewModel[kiosk.culture][kiosk.currentModelKey]["navBar"] = conponentModel;
                    //$.extend(viewModel[kiosk.culture][kiosk.currentModelKey], conponentModel);
                },

                updateFoot: function (componentName, conponentModel) {
                    currentFoot = componentName;
                    $.extend(currentModel, conponentModel);
                }
            }
        });

        window.onhashchange = function(e) {
        };
        kiosk.app = mainApp;
        $('a').attr('draggable', false);
        $('img').attr('draggable', false);
        var idlesecond = parseInt(kiosk.API.idle.getIdleSeconds());
        if (idlesecond != NaN && idlesecond != 0)
            setInterval(kiosk.API.Timmer, idlesecond * 1000);
    };


    var startMain = function() {
        var Complites = $.map(templateComplite, function(value, index) {
            if (value.template && value.component) {
                return value;
            }
        });
        //     console.log('Complites:' + Complites.length);
        if (Complites.length == max) {
            StartMainApp();
        }



    }
    loadTemplate(0);
    startMain();
})();