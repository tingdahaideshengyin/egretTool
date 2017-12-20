package pngSort
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.filesystem.File;
	import flash.filesystem.FileMode;
	import flash.filesystem.FileStream;
	import flash.geom.Rectangle;
	import flash.utils.ByteArray;
	
	import mx.graphics.codec.PNGEncoder;
	
	import nodep.util.FileUtil;
	
	public class PngSorter extends Bitmap
	{
		private var _targetFile:File;
		private var _loader:Loader;
		
		public function PngSorter(f:File)
		{
			this._targetFile = f;
			var fs:FileStream = new FileStream();
			fs.open(f,FileMode.READ);
			var bytes:ByteArray = new ByteArray();
			fs.readBytes(bytes);
			fs.close();
			_loader = new Loader();
			_loader.contentLoaderInfo.addEventListener(Event.COMPLETE,completedHandler);
			_loader.loadBytes(bytes);
		}
		
		private function completedHandler(evt:Event):void{
			_loader.contentLoaderInfo.removeEventListener(Event.COMPLETE,completedHandler);
			this.bitmapData = (_loader.content as Bitmap).bitmapData;
		}
		
		public function exportTo(toUrl:File,rect:Rectangle):void{
			var w:int = rect.width - rect.x;
			var h:int = rect.height - rect.y;
			var bit:Bitmap = new Bitmap(this.bitmapData);
			var sp:Sprite = new Sprite();
			bit.x = this.x - rect.x;
			bit.y = this.y - rect.y;
			sp.addChild(bit);
			var ecd:PNGEncoder = new PNGEncoder();
			var btd:BitmapData = new BitmapData(w,h,true,0);
			btd.draw(sp);
			var bts:ByteArray = ecd.encode(btd);
			FileUtil.saveFile(bts,toUrl.nativePath+"/"+_targetFile.name);
		}
	}
}