import { Agg , agg , agg_echan , } from "./Life.js" ;
import { Live , ls_set , ls_get , ls_notify } from "./LiveState.js" ;
import { Renn } from "./Renn.js" ;

const log = console.log ;

/* タイプ名を表すフィールド名を定義 */

const tf = "type" ;  /* type name field name */
type tf = typeof tf ;
type tobject < t extends string = string > = { readonly [ tf ] ? : t } ;


/* Ease */

export type Ease < V > =
(
	V extends object ?
	(
		V extends ( infer E ) [] ?
			Row < E > :
			Branch < V >
	) :
	V extends boolean ?
		Live < boolean > :
		Live < V >
) ;


export type Branch < V extends tobject > = Live < V > & Agg &
{
	[ name in keyof V ] : name extends tf ? V [ name ] : Ease < V [ name ] >;
}


export type Branch_ < V extends tobject > = Live < V > & Agg &
{
	[ name in keyof V ] : name extends tf ? V [ name ] : Ease < V [ name ] >;
}

export type Row < E > = Live < E [] > & Agg &
{
	get renn () : Renn < Ease < E > > ;

	at ( pos : number ) : Ease < E > | undefined ;
	insert ( vals : E [] , start ? : number ) : void ;
	delete ( start : number , length : number ) : void ;
	clear () : void ;
}



/* */


export function Ease < V > ( val : V , agg ? : Agg ) : Ease < V >
{
	return val instanceof Object ?
	(
		val instanceof Array ?
			new RowImp ( val , agg ) as any
			: new BranchImp ( val , agg ) as any
	)
	: Live ( val , agg ) as any ;
}


export namespace Ease
{
	export function fromPartial < V extends object >
	(
		i : dp < V > ,
		ctor : ctor < V > ,
		agg ? : Agg ,
	
	) : Ease < V >
	{
		return Ease < V > ( new ctor ( i ) , agg ) ;
	}

	export type dp < V extends object > = dp_i < V > /** Deep Partial */ ;

	export type dp_i < V > =
	(
		V extends object ?
		(
			V extends ( infer E ) [] ? dp_i < E > [] :
			{
				[ P in keyof V ] ? : dp_i < V[P]  >
			}
		) :
		V
	) ;

	export type ctor < V extends object > = new ( i ? : dp < V > ) => V ;
}






/* RowImp */

export class RowImp < E >  extends Live.Core < E [] >  implements Row < E >
{
	constructor ( vals : E [] , agg ? : Agg )
	{
		super ( agg ) ;
		this.insert ( vals ) ;
	}

	/* */

	public [ ls_set ] ( vals : E [] , ch ? : object ) : void
	{
		this.clear () ;
		this.insert ( vals , 0 ) ;
	}

	public [ ls_get ] () : E []
	{
		return this.#_renn.orders.map ( o => o.target.$ ) as E[] ;
	}

	/* */

	get renn () : Renn < Ease < E > > { return this.#_renn ; }

	public at ( pos : number ) : Ease < E > | undefined
	{
		return this.#_renn.at ( pos ) ?.target ;
	}
	
	public insert ( vals : E [] , start ? : number ) : void
	{
		this.#_renn.insert
		(
			vals.map ( val => this.createElement ( val ) , start ) ,
			start
		) ;
	}

	public delete ( start : number , length : number ) : void { this.#_renn.delete ( start , length ) ; }
	public clear () : void { this.#_renn.clear () ; }

	/* */

	public [ agg_echan ] () : void
	{
		this [ ls_notify ] ( undefined ) ;
	}

	protected createElement ( val : E ) : Ease < E >
	{
		return Ease < E > ( val , this ) ;
	}

	#_renn = new Renn < Ease < E > > ( [] , this ) ;
}




/* BranchImp */

export class BranchImp < V extends object >  extends Live.Core < V >  implements tobject , Agg
{
	readonly type ? : string ;

	constructor ( val : V , agg ? : Agg )
	{
		super ( agg ) ;

		this.type = ( val as any ) ?. [ tf ] ;

		Object.entries ( val ) .forEach
		(
			( [ name , val ] ) => {
				if ( name !== tf )
					( this as any ) [ name ] = Ease ( val , this ) ;
			}
		) ;
	}

	public [ ls_set ] ( val : V , ch ? : object ) : void
	{
		Object.entries ( val ).forEach ( ent => setprop ( this , ent ) ) ;
		this [ ls_notify ] ( ch ) ;
	}

	public [ ls_get ] () : V
	{
		const rt : any = { [ tf ] : this.type } ;
		Object.entries ( this ).forEach
		(
			( [ name , ls ] ) => {
				if ( ls instanceof Live.Core ) {
					rt [ name ] = ls.$ ;
				}
			}
		)

		return rt ;
	}

	public [ agg_echan ] () : void
	{
		this [ ls_notify ] ( undefined ) ;
	}
}

function setprop ( br : any , [ name , val ] : [ any , any ] )
{
	const ls = br [ name ] ;
	if ( ls instanceof Live.Core )
	{
		ls.set ( val , br ) ;
	}
}

