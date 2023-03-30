(function() {
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
                    },
                    3000)
            } else {
                kiosk.API.Device.postToDeviceWithCallback(
                    JSON.stringify(self.generuteParemater("ScanningBarCode", regex)),
                    function(res) {
                        callback(JSON.parse(res));
                    });
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
                $.each(el.attributes,
                    function(index, attr) {
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

                $.each(el.childNodes,
                    function(key, child) {
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
            $.each(xmlDoc.getElementsByTagName('THERMAL_PRINT'),
                function(key, type) {
                    self[type.getAttribute('id').toLowerCase()] = [];
                    $.each(type.getElementsByTagName('THERMAL_PAGE'),
                        function(key, page) {
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
                            $.each(page.childNodes,
                                function(key, child) {
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
            $.each(subData,
                function(key, obj) {
                    $.each(subTag.child,
                        function(k, tag) {
                            var tagTemp = $.extend(true, {}, tag);
                            if (tagTemp.Type != 'THERMAL_SUBCONTENT') {
                                if (tagTemp.Type != 'THERMAL_CUTPAGE') {
                                    var isNull = false;
                                    tagTemp.InnerText = tagTemp.InnerText.replace(/\{\{(.*?)\}\}/g,
                                        function(match, token) {
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
                                global.API.concat(tags,
                                    self.parseSubContent(tagTemp, data[tagTemp.Attubites.datasource]));
                            }
                        });
                });
            return tags
        },

        Open: function() {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("Open")));
        },

        CutPaper: function() {
            kiosk.API.Device.postToDeviceWithoutCallback(
                JSON.stringify(this.generuteParemater("CutPaper", { content: 0 })));
        },

        PrintText: function(text) {
            kiosk.API.Device.postToDeviceWithoutCallback(
                JSON.stringify(this.generuteParemater("PrintText", { content: text })));
        },

        PrintBitmap: function(filePath, size, alignment) {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("PrintBitmap"),
                {
                    Content: filePath,
                    Size: size || 229,
                    Alignment: alignment || 'Center',
                }));
        },

        PrintBarCode: function(code, size, alignment, position, codeType) {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("PrintBarCode"),
                {
                    Content: code,
                    Size: size || 80,
                    Alignment: alignment || 'Center',
                    Position: position || 'Below',
                    CodeType: codeType || 'Code128'
                }));
        },

        PrintQRCode: function(code, size, alignment, position) {
            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(this.generuteParemater("PrintQRCode"),
                {
                    Content: code,
                    Size: size || 150,
                    Alignment: alignment || 'Center',
                    Position: position || 'Below',
                }));
        },

        CheckNearEnd: function() {
            return kiosk.API.Device.sendToDevice(
                JSON.stringify(this.generuteParemater("CheckNearEnd", {}, 'SendRequest')));
        },

        parsePage: function(tags, data) {
            var pageTags = [];
            $.each(tags,
                function(k, tag) {
                    var isNull = true,
                        isReplase = false;
                    if (tag.Type != 'THERMAL_SUBCONTENT') {
                        tag.InnerText = tag.InnerText.replace(/\{\{(.*?)\}\}/g,
                            function(match, token) {
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
                if (testFlag.viewDebugger)
                    self.GetTemplate();
                else
                    self.generateTemplate();
            }
            var pageData = $.extend(true, {}, self.receiptTemplate[receiptType]);

            $.each(data,
                function(key, pd) {
                    $.each(pageData,
                        function(key, page) {
                            var np = $.extend(true, {}, page);
                            kiosk.API.Device.postToDeviceWithoutCallback(JSON.stringify(self.generuteParemater(
                                "PrintTemplatePage",
                                {
                                    content: JSON.stringify([
                                        {
                                            tags: self.parsePage(np.tags, pd),
                                            rotation: page.rotation
                                        }
                                    ])
                                })));
                        });
                });
        },

        GetTemplate: function() {
            var self = this;
            if (testFlag.viewDebugger) {
                var result = {
                    "IsSuccess": "true",
                    "IsNearEnd": "false",
                    "Result":
                        "\r\n\r\n<THERMAL_TEMPLATE>\r\n\t<THERMAL_PRINT id=\"DigitalPin\">\r\n\t\t<THERMAL_PAGE>\t\t\t\r\n\t\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\t\t\t\t\t\t\t\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\r\n\t<THERMAL_PRINT id=\"InstantTopup\">\r\n\t\t<THERMAL_PAGE>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\r\n\t<THERMAL_PRINT id=\"BillPayment\">\r\n\t\t<THERMAL_PAGE>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\t\r\n</THERMAL_TEMPLATE>",
                    "Error": null
                }
            } else {
                var xmlStr =
                    kiosk.API.Device.sendToDevice(JSON.stringify(this.generuteParemater("GetTemplateXML", {})));
                var result = JSON.parse(xmlStr);
            }

            var xmltxt = result.Result;
            self.receiptTemplate = self.generateTemplate(xmltxt);
        }
    };

    // === MD150 飛捷讀卡機 ===
    kiosk.API.Device.MD150 = {
        DeviceAction: {
            DisConnect: 0,
            Connect: 1,
            GetCardID: 2,
            GetBlockData: 3
        },
        generuteParemater: function (action, comPort, keyValue, blockNum) {
            var DeviceCmd = {
                comPort: comPort,
                keyValue: keyValue,
                blockNum: blockNum
            },
                actionCmd = {
                    Action: action,
                    Parameter: JSON.stringify(DeviceCmd)
                },
                cmd = {
                    "DeviceName": "MD150",
                    "Worktype": "PostRequest",
                    "Paremater": JSON.stringify(actionCmd),
                    "ReponseModule": "UI",
                };
            return cmd;
        },
        Open: function (success, fail, comPort) {
            kiosk.API.Device.postToDeviceWithCallback(
                JSON.stringify(this.generuteParemater(this.DeviceAction.Connect, comPort)),
                function (res) {
                    var result = JSON.parse(res);
                    if (result.IsSuccess) {
                        success(result);
                    }
                    else {
                        success(result);
                        kiosk.API.log.logError(res, 'MD150_Connect', 'MD150');
                    }
                });
        },
        Close: function (success, fail) {
            kiosk.API.Device.postToDeviceWithCallback(
                JSON.stringify(this.generuteParemater(this.DeviceAction.DisConnect)),
                function (res) {
                    var result = JSON.parse(res);
                    if (result.IsSuccess) {
                        success(result);
                    }
                    else {
                        success(result);
                        kiosk.API.log.logError(res, 'MD150_DisConnect', 'MD150');
                    }
                });
        },
        GetCardID: function (success, fail) {
            kiosk.API.Device.postToDeviceWithCallback(
                JSON.stringify(this.generuteParemater(this.DeviceAction.GetCardID)),
                function (res) {
                    var result = JSON.parse(res);
                    if (result.IsSuccess) {
                        success(result);
                    }
                    else {
                        success(result);
                        kiosk.API.log.logError(res, 'MD150_GetCardID', 'MD150');
                    }
                });
        },
        GetBlockData: function (success, fail, p1, p2, p3) {
            kiosk.API.Device.postToDeviceWithCallback(
                JSON.stringify(this.generuteParemater(this.DeviceAction.GetBlockData, p1, p2, p3)),
                function (res) {
                    var result = JSON.parse(res);
                    if (result.IsSuccess) {
                        success(result);
                    }
                    else {
                        success(result);
                        kiosk.API.log.logError(res, 'MD150_GetBlockData', 'MD150');
                    }
                });
        }
    };
    // =======================
})()