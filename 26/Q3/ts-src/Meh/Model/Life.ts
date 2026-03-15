import { lf_refs , lf_agg , lf_sub , lf_unsub , lf_term , agg_echan } from "./symbols.js" ;

const lf_ru = Symbol () ;

const ru =
{
	_next : 1 ,
	balance : 0 ,
	next () : string
	{
		this.balance ++ ;
		return "RU_" + this._next ++ ;
	}
}

export const monitor =
{
	get next_ru () : number { return ru._next ; } ,
	get balance () : number { return ru.balance ; }
}





/**
 *  動的な集約オブジェクト(配列や構造体)の定義。
 *  要素からの構造や値の変更通知を受け取る。
 */

export interface Agg
{
	[ agg_echan ] () : void ;
}



/**
 * リアクティブステートモデルの基底となる、ライフを表現するクラス。
 * オブザーバーとなる refs にライフ終了を通知する。
 */

export class Life < R extends Life.Ref >
{
	[ lf_ru ] : string = ru.next () ;
	[ lf_refs ] = new Set < R > ;
	[ lf_agg ] ? : Agg ;

	/** 通知を受け取る ref を refs に追加。 */

	[ lf_sub ] ( ref : R )
	{
		this [ lf_refs ] .add ( ref ) ;
	}

	/** ref を refs から削除 */

	[ lf_unsub ] ( ref : R )
	{
		if ( ! this [ lf_refs ] .has ( ref ) )  return ;

		this [ lf_refs ] .delete ( ref ) ;
		ref.unsub ?.() ;
	}

	/** オブジェクト終了命令 */

	[ lf_term ] ()
	{
		this [ lf_refs ] .forEach
		(
			ref => ref.unsub ?.()
		) ;

		this [ lf_refs ] .clear () ;

		ru.balance -- ;
	}
}

export namespace Life
{
	/**
	 * Life のオブザーバー。
	 * lterm () で終了通知を受け取る。
	 * 
	 */

	export interface Ref
	{
		unsub ? () : void ;
	}

	/** Life メソッド */

	export const ru   = ( lf : Life < any > ) => lf [ lf_ru ] ;		/** ru ランタイムユニーク値を取得。 */
	export const sub   = ( lf : Life < any > , ref : Life.Ref ) => lf [ lf_sub ] ( ref ) ;	/** ref を追加。 */
	export const unsub = ( lf : Life < any > , ref : Life.Ref ) => lf [ lf_unsub ] ( ref ) ;	/** ref を除去 */
}

