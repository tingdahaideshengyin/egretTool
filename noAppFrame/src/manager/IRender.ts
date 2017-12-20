/**
 * 可以逐帧调用的接口
 * @see RenderManager
 * @author nodep
 * @version 1.0
 */
interface IRender {

	/**
	 * 触发函数
	 * @param  {number} interval 距离上一次触发经过的时间
	 */
	renderUpdate(interval: number);
}