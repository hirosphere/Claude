import { Life , life_add_ref , refs , Agg  , agg , agg_echan } from "./Life.js" ;
import { Live , } from "./LiveState.js" ;

const log = console.log ;




/* */

export class Renn < T >  extends Life < Renn.Ref < T > >  implements Agg
{
	public get length () : Live.R < number > { return this.#_length ; } ;

	constructor ( targets ? : T [] , agg ? : Agg )
	{
		super ( agg ) ;

		this.#_orders = create_orders ( this , 0 , targets ) ;
		this.update ( 0 ) ;
	}

	/*  */

	public add_ref ( ref : Renn.Ref < T > ) : void
	{
		Life.add_ref ( this , ref ) ;
	}

	public override [ life_add_ref ] ( ref : Renn.Ref < T > ) : void
	{
		super [ life_add_ref ] ( ref ) ;
		ref.insert ?. ( 0 , this.#_orders ) ;
	}

	/* */

	public insert ( targets : T [] , start ? : number ) : void
	{
		start = pos_trim ( start , this.#_orders ) ;

		const orders = create_orders ( this , start , targets ) ;

		this.#_orders.splice ( start , 0 , ... orders ) ;

		this.update ( start + orders.length ) ;
		this [ refs ] .forEach ( ref => ref.insert ?. ( start , orders ) ) ;
		this [ agg ] ?. [ agg_echan ] () ;
	}

	public delete ( start : number , length : number ) : void
	{
		start = pos_trim ( start , this.#_orders ) ;

		const orders = this.#_orders.splice ( start , length ) ;

		this.update ( start ) ;
		this [ refs ] .forEach ( ref => ref.delete ?. ( start , orders.length ) ) ;
		this [ agg ] ?. [ agg_echan ] () ;
	}

	public clear () : void
	{
		this.delete ( 0 , this.#_orders.length ) ;
	}

	/* */

	public replace ( targets : T [] ) : void
	{
		this.clear () ;
		this.insert ( targets ) ;
	}

	public get targets () : T []
	{
		return this.#_orders.map ( o => o.target ) ;
	}

	public get orders () : readonly Order < T > []
	{
		return this.#_orders ;
	}

	public at ( pos : number ) : Order < T > | undefined
	{
		return this.#_orders [ pos ] ;
	}

	public each ( oper : ( target : T , order : Order < T > ) => void ) : void
	{
		this.#_orders.forEach ( o => oper ( o.target , o ) ) ;
	}

	/* */

	public [ agg_echan ] () : void
	{
		this [ refs ] .forEach  ( ref => ref.eChan ?.() ) ;
		this [ agg ] ?. [ agg_echan ] () ;
	}

	/*  */

	protected update ( start : number ) : void
	{
		for ( let pos = start ; pos < this.#_orders.length ; pos ++ )
		{
			Live.set ( this.#_orders [ pos ] , pos , this ) ;
		}
		
		Live.set ( this.#_length , this.#_orders.length ) ;
	}

	#_orders : OI < T > [] ;
	#_length = new Live.Leaf ( 0 ) ;
}

const create_orders = < T > ( agg : Renn < T > , start : number , targets ? : T [] ) : OI < T > [] =>
{
	if ( ! targets )  return [] ;

	const rt : OI < T > [] = [] ;
	for ( let i = 0 ; i < targets.length ; i ++ )
	{
		rt.push ( new OI ( targets [ i ] , start + i , agg ) ) ;
	}
	return rt ;
}

const pos_trim = ( start : number | undefined , ar : Array < any > ) =>
{
	return Math.max ( 0 , Math.min ( ar.length , start ?? ar.length ) ) ;
}

export namespace Renn
{
	export type Ref < T > = Life.Ref &
	{
		insert ? ( start : number , orders : Order < T > [] ) : void ;
		delete ? ( start : number , length : number ) : void ;

		eChan ? () : void ;
	}
}


/* Order */

export type Order < T > = Live.R < number > & O < T > ;

type O < T > =
{
	readonly target : T ;

	next : Order < T > | undefined ;
	prev : Order < T > | undefined ;

	delete () : void ;
}

export class OI < T >  extends Live.Leaf < number >  implements O < T >
{
	constructor ( public readonly target : T , pos : number , protected renn : Renn < any > )
	{
		super ( pos , renn ) ;
	}

	public delete () : void
	{
		this.renn.delete ( Live.get ( this ) , 1 ) ;
	}

	public get next () : Order < T > | undefined
	{
		return this.renn.orders [ ( Live.get ( this ) ) + 1 ] ;
	}

	public get prev () : Order < T > | undefined
	{
		return this.renn.orders [ ( Live.get ( this ) ) - 1 ] ;
	}

	public override toString ()
	{
		return Live.get ( this ) ;
	}
}
