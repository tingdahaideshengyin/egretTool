/**
 * 数据
 */
interface ItemRender {
	updateData(d: any);
	getData(): any;
	playIn();
	$setVisible(value: boolean): boolean;
}