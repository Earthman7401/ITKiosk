//封裝瀏覽器擴充呼叫的物件
function KioskClient() {

    //封裝應用程式任務相關處理中介呼叫的物件
    this.Task = new function () {
        //取得預設任務資訊物件
        this.GetDefaultTaskInfo = function () {
            return window.external.Task.GetDefaultTaskInfo();
        };
        //新增一個自訂任務
        this.AddTask = function (info) {
            return window.external.Task.AddTask(info);
        };
        //新增一個一次性執行的任務
        this.AddOnceTask = function (p1, p2, p3, p4, p5, p6, p7) {
            if (p7 === undefined) {
                //path, param, info, timeout, delay, level
                return window.external.Task.AddOnceApplication(p1, p2, p3, p4, p5, p6);
            }
            else {
                //fullName, method, param, info, timeout, delay, level
                return window.external.Task.AddOnceTask(p1, p2, p3, p4, p5, p6, p7);
            }
        };
        //新增一個定時執行的任務
        this.AddIntervalTask = function (p1, p2, p3, p4, p5, p6) {
            if (p6 === undefined) {
                //path, param, days, times, timeout
                return window.external.Task.AddIntervalApplication(p1, p2, p3, p4, p5);
            }
            else {
                //fullName, method, param, days, times, timeout
                return window.external.Task.AddIntervalTask(p1, p2, p3, p4, p5, p6);
            }
        };
    }();

    //封裝壓縮與解壓縮相關中介呼叫的物件
    this.Zip = new function () {
        //取得封裝壓縮檔的註解資訊字串
        this.GetZipCommentString = function (file) {
            return window.external.Zip.GetZipCommentString(file);
        };
        //取得封裝壓縮檔的註解資訊字典集合
        this.GetZipComment = function (file) {
            return window.external.Zip.GetZipComment(file);
        };
        //寫入封裝壓縮檔的註解資訊字串
        this.SetZipCommentString = function (file, comment) {
            return window.external.Zip.SetZipCommentString(file, comment);
        };
        //寫入封裝壓縮檔的註解資訊字典集合
        this.SetZipComment = function (file, comment, overwrite) {
            return window.external.Zip.SetZipComment(file, comment, overwrite);
        };
        //壓縮封裝目錄
        this.ZipDir = function (directory, target) {
            return window.external.Zip.ZipDir(directory, target);
        };
        //壓縮封裝檔案
        this.ZipFiles = function (files, target) {
            return window.external.Zip.ZipFiles(files, target);
        };
        //解壓縮封裝檔案
        this.UnZipFile = function (file, target) {
            return window.external.Zip.UnZipFile(file, target);
        };
    }();

    //封裝網路相關中介呼叫的物件
    this.Net = new function () {
        //取得啟用的網路介面卡顯示名稱陣列
        this.GetAdapterLsit = function () {
            return window.external.Net.GetAdapterLsit();
        };
        //設定網際網路通訊協定 (IP) 位址
        this.SetIPAddress = function (name, ip) {
            return window.external.Net.SetIPAddress(name, ip);
        };
        //設定網路組態
        this.SetNetworkConfiguration = function (info) {
            return window.external.Net.SetNetworkConfiguration(info);
        };
        //檢查指定IP連線狀態
        this.Ping = function (hostNameOrAddress) {
            return window.external.Net.Ping(hostNameOrAddress);
        };
        //清除IE Cache
        this.ClearIECache = function () {
            return window.external.Net.ClearIECache();
        };
        //取得目前使用者 Internet Explorer 的 Proxy 設定資訊物件
        this.GetSystemWebProxy = function () {
            return window.external.Net.GetSystemWebProxy();
        };
        //從FTP下載一個指定檔案
        this.DownloadFile = function (info, name, file, timeout, proxy) {
            if (proxy === undefined) {
                //無指定Proxy
                return window.external.Net.DownloadFile(info, name, file, timeout);
            }
            else {
                //指定Proxy
                return window.external.Net.DownloadFileByProxy(info, name, file, timeout, proxy);
            }
        };
        //上傳一個指定檔案到FTP
        this.UploadSingleFile = function (info, name, file, timeout, proxy) {
            if (proxy === undefined) {
                //無指定Proxy
                return window.external.Net.UploadSingleFile(info, name, file, timeout);
            }
            else {
                //指定Proxy
                return window.external.Net.UploadSingleFileByProxy(info, name, file, timeout, proxy);
            }
        };
        //在FTP上建立指定目錄
        this.MakeDirectory = function (info, name, timeout, proxy) {
            if (proxy === undefined) {
                //無指定Proxy
                return window.external.Net.MakeDirectory(info, name, timeout);
            }
            else {
                //指定Proxy
                return window.external.Net.MakeDirectoryByProxy(info, name, timeout, proxy);
            }
        };
        //封裝檔案並上傳
        this.UploadFiles = function (files, info, comment) {
            if (comment === undefined) {
                //無額外封裝註解資訊
                return window.external.Net.UploadFiles(files, info);
            }
            else {
                //額外封裝註解資訊
                return window.external.Net.UploadFilesForComment(files, info, comment);
            }
        };
        //取得以預設FTP伺服器建立的上傳用資訊物件
        this.GetDefaultUploadInfo = function () {
            return window.external.Net.GetDefaultUploadInfo();
        };
        //取得FTP指定目錄下的檔案清單明細
        this.GetDirList = function (info, timeout) {
            return window.external.Net.GetDirList(info, timeout);
        };
    }();

    //封裝系統相關中介呼叫的物件
    this.System = new function () {
        //執行系統關機
        this.ShudDown = function () {
            window.external.System.ShudDown();
        };
        //執行系統重開機
        this.Reboot = function () {
            window.external.System.Reboot();
        };
        //檢查本機使用者密碼
        this.CheckPassword = function (password) {
            return window.external.System.CheckPassword(password);
        };
        //檢查使用者帳號密碼
        this.CheckAccountPassword = function (username, password, type) {
            if (type === undefined) {
                return window.external.System.CheckAccountPassword(username, password);
            }
            else {
                return window.external.System.CheckAccountPasswordByType(username, password, type);
            }
        };
    }();

    //封裝應用程式設定相關中介呼叫的物件
    this.Config = new function () {
        ////取得應用程式設定的FTP伺服器資訊物件
        //this.FTPServerInfo = window.external.Config.FTPServerInfo;
        //寫入設定(javascript模擬多載呼叫)
        this.SetConfig = function (key, value, name) {
            //也可用arguments.length判斷參數數量,並透過arguments[0]取出參數
            if (name === undefined) {
                //寫入設定(預設)
                window.external.Config.SetConfig_Default(key, value);
            }
            else {
                //寫入設定
                window.external.Config.SetConfig(key, value, name);
            }
        };
        //讀取設定
        this.GetConfig = function (key, name) {
            if (name === undefined) {
                //讀取設定(預設)
                return window.external.Config.GetConfig_Default(key);
            }
            else {
                //讀取設定
                return window.external.Config.GetConfig(key, name);
            }
        };
        //移除設定
        this.RemoveConfig = function (key, name) {
            if (name === undefined) {
                //移除設定(預設)
                window.external.Config.RemoveConfig_Default(key);
            }
            else {
                //移除設定
                window.external.Config.RemoveConfig(key, name);
            }
        };
        //刪除設定
        this.DeleteConfig = function (name) {
            if (name === undefined) {
                //刪除設定(預設)
                return window.external.Config.DeleteConfig_Default();
            }
            else {
                //刪除設定
                return window.external.Config.DeleteConfig(name);
            }
        };
    }();

    //////////////以下為瀏覽器擴充////////////////////////

    //返回起始頁面
    this.GoStartPage = function () {
        return window.external.GoStartPage();
    };
    //設定流程變數
    this.SetData = function (key, value) {
        window.external.SetData(key, value);
    };
    //取得流程變數
    this.GetData = function (key) {
        return window.external.GetData(key);
    };
    //移除流程變數
    this.RemoveData = function (key) {
        window.external.RemoveData(key);
    };
    //本機電腦名稱
    this.MachineName = window.external.MachineName;

    this.Device = this.Device || {};

    this.Device.postToDeviceWithCallback = function (cmd, callback) {
        window.external.Device.postToDeviceWithCallback(cmd, callback);
    };
    this.Device.postToDeviceWithoutCallback = function (cmd) {
        window.external.Device.postToDeviceWithoutCallback(cmd);
    };
    this.Device.sendToDevice = function (cmd) {
        var obj = JSON.parse(cmd);
        obj.Worktype = "SendRequest";
        try {
            return window.external.Device.sendToDevice(JSON.stringify(obj));
        } catch (err) {
            return { 'IsSuccess': false, 'result': 'Device Timeout' };
        }

    };
    this.concat = function (current, newAry) {
        $.each(newAry, function (index, obj) {
            current.push(obj);
        });
    };
    this.log = this.log || {};
    this.log.logInfo = function (data, methord, objName) {
        window.external.Log.logInfo(JSON.stringify(
            {
                data: data,
                methord: methord,
                objName: objName
            }
            ));
    };
    this.log.logError = function (err, methord, objName) {
        window.external.Log.logError(JSON.stringify(
            {
                data: err,
                methord: methord,
                objName: objName
            }
            ));
    };
    this.log.logWarn = function (data, methord, objName) {
        window.external.Log.logWarn(JSON.stringify(
            {
                data: data,
                methord: methord,
                objName: objName
            }
            ));
    }
    this.log.logUserBehavior = function (userBehaviorData) {      
        //window.external.Log.logUserBehavior(JSON.stringify(userBehaviorData));
    }

    this.idle = {};
    this.idle.getIdleSeconds = function () {
        //return   window.external.Idle.GetIdleSeconds();
        return 180;
    }
    //debugger;
}
//實體化擴充呼叫物件
var kiosk = kiosk || {};
kiosk.API = kiosk.API || {};
KioskClient.call(kiosk.API);


