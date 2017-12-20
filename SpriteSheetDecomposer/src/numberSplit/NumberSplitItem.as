package numberSplit
{
	import flash.display.Bitmap;
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.utils.ByteArray;
	
	import mx.controls.Button;
	
	/**
	 * 用于分割图片用
	 * @author nodep
	 */	
	public class NumberSplitItem extends Sprite
	{
		private var _loader:Loader;
		private var _bit:Bitmap;
		
		public function NumberSplitItem(bts:ByteArray)
		{
			_loader = new Loader();
			_loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loadCompleteHandler);
			_loader.loadBytes(bts);
		}
		
		private function loadCompleteHandler(evt:Event):void{
			_loader.contentLoaderInfo.removeEventListener(Event.COMPLETE,loadCompleteHandler);
			this._bit = new Bitmap();
			this._bit.bitmapData = (_loader.content as Bitmap).bitmapData;
			this.addChild(_bit);
		}
		
		//添加按钮
		private function addButton(bname:String,bx:int,by:int,label:String):void
		{
			var btn:Button = new Button();
			btn.x = bx;
			btn.y = by;
			btn.name = bname;
			btn.label = label;
			this.addChild(btn);
			btn.addEventListener(MouseEvent.CLICK,optClickHandler);
		}
		
		//对应操作按钮
		private function optClickHandler(evt:MouseEvent):void{
			var bname:String = evt.target.name;
			switch(bname){
				case "addImg":
					break;
			}
		}
	}
}