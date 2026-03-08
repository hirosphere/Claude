import { Live } from "../Model/Model.js";
import { TargetDOMElement } from "./DD.js";
import { DD , MehElement  } from "./DOM.js" ;
import { PartsPlace , createPartsPlace } from "./PartsPlace.js" ;
import { on_connect } from "./priv.js" ;

const log = console.log ;



/* HTMLドキュメントに MehElement / Text を追加 */

export const add =
(
	dec : DD.Part | DD.Part [] ,	/* 追加したいエレメント/ノードの宣言 */
	celq : Element | string ,		/* 追加先のエレメント/クエリー */
	relq ? : Node | string		/* 追加したい位置の後に来るエレメント/クエリー */

) : PartsPlace | undefined =>
{
	const cel = typeof celq == "string" ? document.querySelector ( celq ) : celq ;
	const rel = typeof relq == "string" ? document.querySelector ( relq ) : relq || null ;

	if ( cel == null )  return ;

	const ppl = PartsPlace.create
	(
		dec instanceof Array ? dec : [ dec ] ,
		cel ,
	) ;

	log ( "add" , cel.isConnected ) ;

	if ( cel.isConnected )
	{
		ppl ?. [ on_connect ] ?. () ;
	}

	return ppl ;
}


/* ElementFactory */


const create = < E extends DD.TargetDOMElement = any >
(
	ns : string ,
	type : string ,

	first : DD.ElementSpec < E > | DD.Part | undefined ,
	remain : DD.Part [] ,

) : MehElement < E > =>
{
	if ( first instanceof Object )
	{
		if
		(
			first instanceof MehElement ||
			first instanceof DD.PartsPlace ||
			first instanceof Live.Core
		)
		{			
			return new MehElement ( ns , type , {} , [ first , ... remain ] ) ;
		}

		return new MehElement ( ns , type , first as DD.ElementSpec < E > , remain ) ;
	}

	return new MehElement ( ns , type , {} , [ first , ... remain ] ) ;
}


type create < E extends TargetDOMElement > =
(
	first ? : DD.ElementSpec < E > | DD.Part ,
	... remain : DD.Part []
)
=> MehElement < E > ;


class Handler < T extends object > implements ProxyHandler < T >
{
	constructor( private ns : string )
	{}

	public get( target : T, type : string )
	{
		return this.makefn( type );
	}

	private fns = new Map < string, create < any > > ;

	private makefn( type : string )
	{
		if( this.fns.has( type ) )  return this.fns.get( type );

		const fn : create < any > = ( first, ... remain ) =>
		(
			create ( this.ns, type, first, remain )
		) ;

		this.fns.set( type, fn );
		return fn;
	}
}


type ElementFactory < Map extends { [ key : string ] : any } > =
{
	[ e in keyof Map ] : create < Map[ e ] > ;
};

export const ef = new Proxy
(
	{} as ElementFactory < HTMLElementTagNameMap >,
	new Handler( "" )
);

export const sf = new Proxy
(
	{} as ElementFactory < SVGElementTagNameMap >,
	new Handler( "http://www.w3.org/2000/svg" )
);
