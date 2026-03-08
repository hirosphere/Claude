const log = console.log ;


const life_ru = Symbol () ;
export const life_term = Symbol () ;
export const life_add_ref = Symbol () ;
export const life_remove_ref = Symbol () ;
export const refs = Symbol () ;

export const agg_echan = Symbol () ;
export const agg = Symbol () ;


let next_ru = 1 ;
let life_count = 0 ;

export class Life < R extends Life.Ref >
{
	constructor ( a ? : Agg )
	{
		life_count ++ ;
		this [ agg ] = a ;
	}

	public [ life_add_ref ] ( ref : R )
	{
		this [ refs ] .add ( ref ) ;
		ref.src = this ;
	}

	public [ life_remove_ref ] ( ref : R )
	{
		this [ refs ] .delete ( ref ) ;
	}

	public [ life_term ] ()
	{
		this [ refs ] .forEach ( ref => ref.lTerm ?.() ) ;
		this [ refs ] .clear () ;
		life_count -- ;

		log ( "term" , this [ life_ru ] , life_count )
	}

	public [ life_ru ] = next_ru ++ ;
	protected [ agg ] ? : Agg ;
	protected [ refs ] = new Set < R > ;
}

export namespace Life
{
	/* methods */

	export const add_ref    = < R extends Ref > ( life : Life < R > , ref : R ) => life [ life_add_ref ] ( ref ) ;
	export const remove_ref = < R extends Ref > ( life : Life < R > , ref : R ) => life [ life_remove_ref ] ( ref ) ;
	export const terminate  = < R extends Ref > ( life : Life < R > ) => life [ life_term ] () ;
	export const ru = ( life : Life < any > ) : number => life [ life_ru ] ;

	/* Ref */

	export type Ref =
	{
		src ? : Life < any > ;
		lTerm ? () : void ;
	}
}

export type Agg =
{
	[ agg_echan ] () : void ;
}
