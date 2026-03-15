import { lf_refs, lf_sub , lf_agg , lf_term , lv_get , lv_set, agg_echan } from "./symbols.js" ;
import { Life , Agg } from "./Life.js" ;

const log = console.log ;


/**
 * 	リアクティブステートモデルの基底クラス。
 *  値の変更を ref に通知。
 */

const vchan = Symbol () ;

export abstract class Live < V >  extends Life < Live.Ref < V > > implements Live.R < V >
{
	/** 値を取得する抽象メソッド。 */

	abstract [ lv_get ] () : V ;


	/** 値をセットして、変更を refs と agg に通知。 */

	[ lv_set ] ( new_v : V , agg ? : Agg ) : void
	{
		this [ lf_refs ].forEach ( ref => ref.vchan ( new_v ) ) ;
		if ( agg && agg == this [ lf_agg ] )  agg [ agg_echan ] () ;
	}


	/** ref を追加して、ref に最初の変更通知。 */

	override [ lf_sub ] ( ref : Live.Ref < V > ) : void
	{
		super [ lf_sub ] ( ref ) ;
		ref.vchan ( this [ lv_get ] () ) ;
	}
}

export namespace Live
{
			/** Live のオブザーバー */

	export interface Ref < V > extends Life.Ref
	{
		vchan ( new_v : V ) : void ;	/** Live からの値変更通知。 */
	}

			/** リードオンリー用のインターフェース */

	export interface R < V > extends Life < Ref < V > >
	{
		[ lv_get ] () : V ;
		[ lf_sub ] ( ref : Ref < V > ) : void ;
	}
}

/** Live オブジェクトへのアクセサ */

export namespace Live
{
	/** 値の取得 */

	export const get = < V > ( lv : Live.R < V > ) : V =>
	{
		return lv [ lv_get ] () ;
	}

	export const set = < V > ( lv : Live < V > , new_v : V , agg ? : Agg ) : void =>
	{
		lv [ lv_set ] ( new_v , agg ) ;
	}
}

export namespace Live
{
	const val = Symbol () ;

	/**
	 *  V型の値の実体を保持する、ステート構造の末端になるクラス。
	 */

	export class Entity < V > extends Live < V >
	{
		[ val ] : V ;

		constructor ( iv : V )
		{
			super () ;
			this [ val ] = iv ;
		}

		/** 値設定の実装 */

		override [ lv_set ] ( new_v : V , agg ? : Agg )
		{
			if ( new_v === this [ val ] )  return ;

			this [ val ] = new_v ;
			super [ lv_set ] ( new_v , agg ) ;
		}

		/** 値取得の実装 */

		override [ lv_get ] () : V
		{
			return this [ val ] ;
		}
	}
}