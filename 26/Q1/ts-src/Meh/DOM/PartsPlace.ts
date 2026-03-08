import { Life , Renn , Order } from "../Model/Model.js" ;
import { DD , MehElement, MehText , MehNode } from "./DOM.js" ;
import { on_connect } from "./priv.js" ;

const log = console.log ;

/* */

export const createPartsPlace =
(
	dec : DD.Part [] ,
	cel : Element | DocumentFragment ,

) : PartsPlace | undefined =>
{
	return new Reader ( dec , cel ).next ;
}


/* */

class Reader
{
	pos = 0 ;

	constructor
	(
		public dec : DD.Part [] ,
		public cel : Element | DocumentFragment ,
		public rel : Node | null = null ,
	)
	{}

	get next () : PartsPlace | undefined
	{
		const cur = this.cur ;
		if ( cur instanceof DD.PartsPlace )
		{
			this.pos ++ ;
			if ( cur instanceof DD.PartsPlace.Each )  return new RennPlace ( cur , this ) ;
			if ( cur instanceof DD.PartsPlace.Key )  return new KeyPlace ( cur , this ) ;
		}

		const dec : DD.Node [] = [] ;

		while ( true )
		{
			if
			(
				this.cur instanceof DD.PartsPlace ||
				this.pos >= this.dec.length
			)
			{
				if ( dec.length )  return new StaticPlace ( dec , this ) ;
				return undefined ;
			}

			if ( this.cur !== undefined ) dec.push ( this.cur ) ;
			this.pos ++ ;
		}
	}

	get cur () : DD.Part | undefined
	{
		return this.dec [ this.pos ] ;
	}
}




/* */

export class PartsPlace
{
	public static create = createPartsPlace ;

	/* */

	meh_nodes : MehNode [] = [] ;

	nextPlace ? : PartsPlace ;
	
	constructor
	(
		protected cel : Element | DocumentFragment ,
	) {}

	get nextNode () : Node | undefined
	{
		return ( this.nextPlace ?.meh_nodes [ 0 ] ?.node ) ?? undefined ;
	}

	protected makePart ( dec : DD.Node , rel ? : Node ) : MehNode
	{
		const mn = dec instanceof MehElement ? dec : new MehText ( dec ) ;
		if ( on_connect in mn )
		{
			log ( "makePart" , mn.node.nodeName , this.cel.isConnected ) ;

			if ( this.cel.isConnected )
			{
				mn [ on_connect ] ?. () ;
			}
			else
			{
				( this.#_on_connect_client ??= [] ) .push ( mn ) ;
				this [ on_connect ] ??= this.#_on_connect ;	
			}
		}
		this.cel.insertBefore ( mn.node , rel ?? null ) ;
		return mn ;
	}

	[ on_connect ] ? () : void ;
	#_on_connect_client ? : MehNode [] ;

	#_on_connect () : void
	{
		this.#_on_connect_client ?.forEach
		(
			client => client [ on_connect ] ?. ()
		)
	}

	public terminate () : void
	{
		this.nextPlace ?.terminate () ;
		
		while ( this.meh_nodes.length )
		{
			this.meh_nodes.pop () ?.terminate () ;
		}
	}
}


/* */

class StaticPlace extends PartsPlace
{
	constructor ( dec : DD.Node [] , rdr : Reader )
	{
		super ( rdr.cel ) ;
		this.meh_nodes = dec.map( dec => this.makePart ( dec ) ) ;
		this.nextPlace = rdr.next ;
	}
}


class KeyPlace extends PartsPlace
{
	constructor ( private dec : DD.PartsPlace.Key < any > , rdr : Reader )
	{
		super ( rdr.cel ) ;
		this.nextPlace = rdr.next ;

		dec.key.add_ref ( this ) ;
	}

	public vChan () : void
	{
		const key = this.dec.key.$ ;
		if ( this.#_nodes.has ( key ) )  return ;

		const dd = this.dec.createNode ( key ) ;
		if ( ! dd )  return ;

		const node = this.makePart ( dd , this.nextNode ) ;

		this.meh_nodes.push ( node ) ;
		this.#_nodes.set ( key , node ) ;
	}

	public override terminate () : void
	{
		this.#_nodes.clear () ;
		this.dec.key.remove_ref ( this ) ;
		super.terminate () ;
	}

	#_nodes = new Map < any , MehNode > ;
}


class RennPlace < EV > extends PartsPlace
{
	#_src : Renn.Ref < EV > ;

	constructor ( protected dec : DD.PartsPlace.Each < EV > , rdr : Reader )
	{
		super ( rdr.cel ) ;

		this.#_src =
		{
			insert : ( start , orders ) =>
			{
				const next = this.meh_nodes [ start ] ?.node ?? this.nextNode ;
				
				const nodes = orders.map
				(
					order => this.makePart
					(
						dec.createNode ( order.target , order ) ,
						next
					)
				) ;

				this.meh_nodes.splice ( start , 0 , ... nodes ) ;
			} ,

			delete : ( start , length ) =>
			{
				const nodes = this.meh_nodes.splice ( start , length ) ;
				nodes.forEach ( node => node.terminate () ) ;
			} ,
		}

		dec.model.add_ref ( this.#_src ) ;

		this.nextPlace = rdr.next ;
	}

	public override terminate () : void
	{
		Life.remove_ref ( this.dec.model , this.#_src ) ;
		super.terminate () ;
	}
}
