package egretExport
{
	import flash.filesystem.File;
	
	import nodep.util.FileUtil;

	public class MinJsCompress
	{
		private static var _keyChars:Array = ["(",",","?","=","{"," ",";"];
		private static var _namesps:Array = ["egret"];
		
		public static function compress(f:File):void{
			MinJsCompress.compressByUrl(f.nativePath);
		}
		
		public static function compressByUrl(url:String):void{
			var code:String = FileUtil.getStr(url);
			trace("源代码长度:"+code.length+"字节");
			for(var namespsIndex:int=0;namespsIndex<_namesps.length;namespsIndex++){
				trace("开始分析命名空间..."+_namesps[namespsIndex]);
				var index:int = code.indexOf(_namesps[namespsIndex]);
				var count:int = 0;
				var diff:Array = [];
				while(index>=0){
					count++;
					var egret:String = code.substr(index-1,7);
					if(diff.indexOf(egret)<0)
						diff.push(egret);
					index = code.indexOf(_namesps[namespsIndex],index+5);
				}
				trace(JSON.stringify(diff));
				trace("预计可以缩小"+count*_namesps[namespsIndex].length+"字节");
				//寻找符合条件的命名空间,进行修改,并且将所有关联的文件全部修改
			}
			trace("开始分析全局函数命名...");
			//t.updateTodayYk=function()
			trace("开始分析成员变量命名...");
			//t.prototype.start=function()
			//t.F_BACK=xxxx   全局变量
		}
	}
}