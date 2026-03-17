import { lf_refs, lf_sub , lf_agg , lf_term , lv_get , lv_set, agg_echan } from "./symbols.js" ;
import { Life , Agg } from "./Life.js" ;

const log = console.log ;


export interface Live < V >  extends Live.R < V >
{
	[ lv_set ] ( new_v : V , changer ? : object ) : void ;
}


export namespace Live
{
	/** リードオンリー用の基底インターフェース */

	export interface R < V > extends Life < Ref < V > >
	{
		[ lv_get ] () : V ;
		[ lf_sub ] ( ref : Ref < V > ) : void ;
	}


	/** Live のオブザーバー */

	export interface Ref < V > extends Life.Ref
	{
		vchan ( new_v : V ) : void ;	/** Live からの値変更通知。 */
	}

	/** * Leaf の生成 **/

	export const create = < V > ( iniv : V , agg ? : Agg ) : Live < V > =>
	{
		return new Live.Leaf ( iniv , agg ) ;
	}

	export const sub = < V > ( liv : Life < Live.Ref < V > > , ref : Live.Ref < V > ) : void =>
	{
		liv [ lf_sub ] ( ref ) ;
	}

	/** * 値の取得 **/

	export const get = < V > ( liv : Live.R < V > ) : V =>
	{
		return liv [ lv_get ] () ;
	}

	/** * 値の設定 **/

	export const set = < V > ( liv : Live < V > , new_v : V , agg ? : Agg ) : void =>
	{
		liv [ lv_set ] ( new_v , agg ) ;
	}

	/** 値の加工 */

	export const mute = < V > ( liv : Live < V > , fn : ( val : V ) => V ) : void =>
	{
		liv [ lv_set ] ( fn ( liv [ lv_get ] () ) ) ;
	}

	/** * 変換 Live の生成 */

	export const trans = < V , S >
	(
		source : Live < S > ,
		tr : Live.trans < V , S > | Live.trans < V , S > [ "get" ]

	) : Live < V > =>
	{
		return new Live.Trans ( source , typeof tr == "function" ? { get : tr } : tr ) ;
	}
}

export namespace Live
{
	/**
	 * 	リアクティブステートモデルの基底クラス。
	 *  値の変更を ref に通知。
	 */

	export abstract class Base < V >  extends Life < Live.Ref < V > > implements Live < V >
	{
		/** 値を取得する抽象メソッド。 */

		abstract [ lv_get ] () : V ;


		/**
		 *   値を設定する基底メソッド。 変更を refs に vchan として通知。
		 * 	 changer が agg と異なれば agg にも通知。
		 */

		[ lv_set ] ( new_v : V , changer ? : object ) : void
		{
			this [ lf_refs ].forEach ( ref => ref.vchan ( new_v ) ) ;

			if ( changer != this [ lf_agg ] )
			{
				this [ lf_agg ] ?. [ agg_echan ] ?. () ;
			}
		}


		/** ref を追加して、ref に最初の変更通知。 */

		override [ lf_sub ] ( ref : Live.Ref < V > ) : void
		{
			super [ lf_sub ] ( ref ) ;
			ref.vchan ( this [ lv_get ] () ) ;
		}
	}

	/** -- -- -- -- -- -- -- -- -- -- */



	/**
	 *  class Leaf < V >
	 * 
	 *  V型の値の実体を保持する、ステート構造の末端になるクラス。
	 *  ( Entity => Leaf に改名 )
	 */


	const leaf_val = Symbol () ;

	export class Leaf < V > extends Base < V >
	{
		[ leaf_val ] : V ;

		constructor ( iv : V , agg ? : Agg )
		{
			super ( agg ) ;
			this [ leaf_val ] = iv ;
		}

		/** 値設定の実装 */

		override [ lv_set ] ( new_v : V , agg ? : Agg )
		{
			if ( new_v === this [ leaf_val ] )  return ;

			this [ leaf_val ] = new_v ;
			super [ lv_set ] ( new_v , agg ) ;
		}

		/** 値取得の実装 */

		override [ lv_get ] () : V
		{
			return this [ leaf_val ] ;
		}
	}


	/**
	 *  class Trans
	 * 
	 * 	変換関数 fn を用い、 source の変換値の変更通知と読み書きを提供。
	 *  source 数値の 0 ~ 1 を、文字列の "0%" ~ "100%" などの変換につかう。
	 */

	export class Trans < V , S >  extends Base < V >
	{
		constructor
		(
			protected source : Live < S > ,
			protected fn : trans < V , S > ,
		)
		{
			super () ;

			const ref : Live.Ref < S > =
			{
				vchan : new_v =>
				{
					super [ lv_set ] ( this.fn.get ( new_v ) )
				} ,

				unsub : () => this [ lf_term ] () ,
			}

			source [ lf_sub ] ( ref ) ;
		}


		/** source からの変換値を提供 */

		[ lv_get ] () : V
		{
			return this.fn.get ( this.source [ lv_get ] () ) ;
		}

		/** 値を source の型に変換して source を更新 */

		override [ lv_set ] ( new_v : V , changer ? : object ) : void
		{
			super [ lv_set ] ( new_v , changer ) ;

			if ( this.fn.set )
			{
				this.source [ lv_set ] ( this.fn.set ( new_v ) ) ;
			}
		} 
	}

	/** Trans用変換関数 */

	export interface trans < V , S >
	{
		get ( src_v : S ) : V ;   //  Source => Trans
		set ? ( tr_v : V ) : S ;  //  Trans => Source
	} 
}

