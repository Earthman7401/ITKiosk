var kiosk = kiosk || {};
(function () {
    kiosk.enum = kiosk.enum || {};
    kiosk.enum.WorkType = {
        SendRequest: 1,
        PostRequest: 2,
        ResetDevice: 3,
        ResetConnection: 4
    };
    kiosk.enum.ScannerAction = {
        Close: 0,
        Open: 1,
        Reset: 3,
        ScanningBarCode: 4,
        ScanningBitMap: 5
    };
    kiosk.enum.ThermalAction = {
        Open: 1,
        Reset: 2,
        CutPaper: 3,
        Close: 4,
        PrintText: 5,
        PrintBitmap: 6,
        PrintBarCode: 7,
        PrintQRCode: 8,
        CheckNearEnd: 9,
        GetReviceStatus: 10,
        TransactionPrint: 11,
        Rotation: 12,
        PrintTemplatePage: 13
    };
    kiosk.enum.culture = {
        'ENUS': 1,
        'ZHTW': 2,
    };
    kiosk.cultureMap = {
        'en-US': kiosk.enum.culture.ENUS,
        'zh-TW': kiosk.enum.culture.ZHTW,
        1: 'en-US',
        2: 'zh-TW',
    };
    kiosk.cultureArry = [1, 2];
    kiosk.wording = {
        1: {
            PrintPage: {
                main: 'Transaction Successfully and Enjoy Your Activity',
                thankyou: 'XXX thanks for your trans.'
            },
        },

        2: {
            PrintPage: {
                main: '交易成功，你可以參加本次活動',
                thankyou: 'XXX 感謝您的選購'
            },
        },
    };
})();
