module nodep {
	export class TweenItem {
		public type: string;
		public props: any;
		public durT: number;
		public ease: Function;
		public constructor(t: string) {
			this.type = t;
		}
		public dispose(): void {
			this.props = null;
			this.ease = null;
		}
	}
}