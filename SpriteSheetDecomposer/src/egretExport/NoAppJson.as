package egretExport
{
	import flash.filesystem.File;
	
	import nodep.util.FileUtil;

	public class NoAppJson
	{
		public static function create(file:File):void{
			var skinList:Array = [];
			var res:Object = {};
			var srcPath:String = file.nativePath+"/main.min.js";
			var srcCode:String = FileUtil.getStr(srcPath);
			var jsonPath:String = file.nativePath+"/resource/config/description.json";
			var resPath:String = file.nativePath+"/resource/default.res.json";
			var thmPath:String = file.nativePath+"/resource/default.thm.json";
			//获取真实存在的资源列表
			var resJson:String = FileUtil.getStr(resPath);
			var resObj:Object = JSON.parse(resJson);
			var resList:Array = [];
			var i:int;
			for(i=0;i<resObj.groups.length;i++){
				if(resObj.groups[i].name!="preload"){
					var resKeys:Array = (resObj.groups[i].keys as String).split(",");
					while(resKeys.length>0)
						resList.push(resKeys.pop());
				}
			}
			//获取皮肤配置文件
			var thmJson:String = FileUtil.getStr(thmPath);
			var thmObj:Object = JSON.parse(thmJson);
			for(i=0;i<thmObj.exmls.length;i++){
				var path:String = thmObj.exmls[i]["path"];
				var ss:Array = path.split("/");
				var skinName:String = ss[ss.length-1];
				if(skinName.indexOf("Skin.exml")>=0)
					continue;
				skinName = skinName.split(".")[0];
				if(!isGameWindow(srcCode,skinName))
					continue;
				var info:String = thmObj.exmls[i]["content"];
				var fontInfo:String = info;
				var sIndex:int = info.indexOf("source=\"");
				var sl:Array = [];
				var yhIndex:int;
				var resName:String;
				while(sIndex>=0){
					info = info.substr(sIndex+8);
					yhIndex = info.indexOf("\"");
					resName = info.substring(0,yhIndex);
					if(resName.indexOf(".")>=0){
						resName = resName.split(".")[0];
					}
					if(resList.indexOf(resName)>=0 && sl.indexOf(resName) < 0){
						sl.push(resName);
					}
					sIndex = info.indexOf("source=\"");
				}
				sIndex = fontInfo.indexOf("font=\"");
				while(sIndex>=0){
					fontInfo = fontInfo.substr(sIndex+6);
					yhIndex = fontInfo.indexOf("\"");
					resName = fontInfo.substring(0,yhIndex);
					if(resName.indexOf(".")>=0){
						resName = resName.split(".")[0];
					}
					if(resList.indexOf(resName)>=0 && sl.indexOf(resName) < 0 && resName.indexOf("_fnt")>=0){
						sl.push(resName);
						var ins:String = resName.split("_")[0];
						sl.push(ins+"_png");
					}
					sIndex = fontInfo.indexOf("font=\"");
				}
				if(sl.length>0){//需要保存这个皮肤
					skinList.push(skinName);
					res[skinName] = sl;
				}
			}
			var obj:Object = {"skinList":skinList,"res":res};
			var saveStr:String = JSON.stringify(obj);
			FileUtil.saveStr(jsonPath,saveStr);
		}
		
		public static function isGameWindow(srcCode:String,cls:String):Boolean{
				var str:String = srcCode.substr(srcCode.indexOf("var "+cls+"="));
				var endIndex:int = 0;
				var khsl:int = 0;
				for(var i:int=0;i<str.length;i++){
					if(str.charAt(i)== "{"){
						khsl++;
					}else if(str.charAt(i) == "}"){
						khsl--;
						if(khsl==0){
							endIndex = i;
							break;
						}
					}
				}
				khsl = 0;
				for(i=endIndex;i<str.length;i++){
					if(str.charAt(i) == ";"){
						khsl++;
						if(khsl==2){
							endIndex = i+1;
							break;
						}
					}
				}
				str = str.substring(0,endIndex);
			return str.indexOf("(GameWindow);")>=0;
		}
	}
}