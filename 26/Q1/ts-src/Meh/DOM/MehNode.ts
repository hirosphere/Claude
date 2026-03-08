import { Life , Plain , Live } from "../Model/Model.js" ;
import * as DD from "./DD.js" ;
import { PartsPlace } from "./PartsPlace.js" ;
import { on_connect } from "./priv.js" ;

const log = console.log ;



/* */

export abstract class MehNode
{
	public abstract node : Node ;
	#srcs = new Set < Live.Ref > ;

	protected bindState
	(
		state : any ,
		update : ( new_v : any ) => void ,
	
	) : void
	{
		if ( state instanceof Live.Core )
		{
			const ref =
			{
				source : state ,
				vChan : () => update ( Live.get ( state ) ) ,
			}

			this.#srcs.add ( ref ) ;
			// Live.add_ref ( text , ref ) ;
			state.add_ref ( ref ) ;
		}

		else  update ( state ) ;
	}

	[ on_connect ] ? () : void ;

	public terminate ()
	{
		this.node.parentElement ?.removeChild ( this.node ) ;
		this.#srcs.forEach ( ref => ref.src && Life.remove_ref ( ref.src , ref ) ) ;
		this.#srcs.clear () ;
	}
}



/*  */

export class MehText extends MehNode
{
	readonly node : Node ;

	constructor ( text : DD.Text )
	{
		super () ;

		this.node = document.createTextNode ( "" ) ;

		this.bindState
		(
			text ,
			new_v => this.node.nodeValue = String ( new_v )
		) ;
	}
}


/*  */

export class MehElement < E extends DD.TargetDOMElement >  extends MehNode
{
	public readonly el : E ;

	#_parts ? : PartsPlace ;


	constructor
	(
		ns : string ,
		type : string ,
		dec : DD.ElementSpec < E > ,
		parts : DD.Part [] ,
	)
	{
		super () ;

		this.el = makeElement ( ns , type , dec ) as E ;

		/* bind props */

		if ( dec.class )  this.bindClass ( dec.class ) ;
		if ( dec.style )  this.bindStyle ( dec.style ) ;
		if ( dec.props )  this.bindProps ( dec.props ) ;
		if ( dec.attrs )  this.bindAttrs ( dec.attrs , ns ) ;
		if ( dec.biBind )  this.bindBB ( dec.biBind ) ;
		if ( dec.passive )  this.setActions ( dec.passive , true ) ;
		if ( dec.active )  this.setActions ( dec.active , false ) ;
		if ( dec.focus )  this.bindFocus ( dec.focus ) ;

		/* build parts */

		if ( parts )
		{
			if ( dec.shadow !== undefined )
			{
				const root = this.el.attachShadow ( { mode : "open" } ) ;
				this.setCSS ( dec.shadow , root ) ;
				this.#_parts = PartsPlace.create ( parts , root ) ;
			}

			else
			{
				dec.css && this.setCSS ( dec.css , document ) ;
				this.#_parts = PartsPlace.create ( parts , this.el ) ;
			}
		}

		/* Hook */

		const hook = dec.hook ;

		if ( hook )
		{
			hook.el = this.el ;
			if ( hook.connect )
			{
				this.#_hook = hook ;
				this [ on_connect ] = this.#_on_connect ;
			}
			hook.init ?.( this.el ) ;
		}
	}

	public get node () : Node
	{
		return this.el ;
	}

	#_on_connect () : void
	{
		this.#_parts ?. [ on_connect ] ?. () ;
		this.#_hook ?. connect ?. ( this.el ) ;
	}

	#_hook ? : DD.Hook < any > ;

	/* */

	protected bindClass ( dec : DD.Class ) : void
	{
		if ( Array.isArray ( dec ) )
		{
			dec.forEach ( dec => this.bindClass ( dec ) ) ;
			return ;
		}
		
		if ( typeof dec == "string" )
		{
			this.el.classList.add ( ... ClassPlace.to_set ( dec ) ) ;
		}

		else if ( dec instanceof Live.Core && typeof dec.$ == "string" )
		{
			const place = new ClassPlace ( this.el ) ;
			this.bindState ( dec , names => place.classNames = names ) ;
		}

		else for ( const [ className , state ] of Object.entries ( dec ) )
		{
			this.bindState
			(
				state ,
				state => this.el.classList.toggle ( className , state )
			) ;
		}
	}

	protected bindStyle ( dec : DD.Style ) : void
	{
		for ( const [ name , value ] of Object.entries ( dec ) )
		{
			this.bindState
			(
				value ,
				value => ( this.el.style as any ) [ name ] = value
			);
		}
	}

	protected setCSS ( dec : DD.CSS , root : Document | ShadowRoot ) : void
	{
		if ( dec instanceof Array )
		{
			dec.forEach ( dec => this.setCSS ( dec , root ) ) ;
			return ;
		}

		if ( dec instanceof CSSStyleSheet )  root.adoptedStyleSheets.push ( dec ) ;

		else
		{
			const ss = new CSSStyleSheet () ;

			if ( dec instanceof Live.Core )
			{
				this.bindState ( dec , state => ss.replace ( state ) ) ;
			}
			else if ( typeof dec == "string" ) ss.replace ( dec ) ;

			root.adoptedStyleSheets.push ( ss ) ;
		}
	}

	protected bindAttrs ( dec : DD.Props < any > , ns : string ) : void
	{
		for ( const [ name , value ] of Object.entries ( dec ) )
		{
			this.bindState ( value , value => setAttribute ( ns , this.el , name , value ) )
		}
	}

	protected bindProps ( dec : DD.Props < any > )
	{
		for ( const [ name , value ] of Object.entries ( dec ) )
		{
			this.bindState ( value , value => ( this.el as any ) [ name ] = value ) ;
		}	
	}

	protected bindBB ( dec : DD.BB )
	{
		dec.vInp  && this.bindbb ( "input"  , "value" , dec.vInp  ) ;
		dec.vChan && this.bindbb ( "change" , "value" , dec.vChan ) ;

		dec.vInpN  && this.bindbb ( "input"  , "value" , dec.vInpN , sncv  ) ;
		dec.vChanN && this.bindbb ( "change" , "value" , dec.vChanN , sncv ) ;

		dec.chInp  && this.bindbb ( "input"  , "checked" , dec.chInp  ) ;
		dec.chChan && this.bindbb ( "change" , "checked" , dec.chChan ) ;
	}


	protected bindbb ( type : string , prop : string , state : Plain < any > , cv ? : typeof sncv ) : void
	{
		this.bindState
		(
			state ,
			state => ( this.el as any ) [ prop ] = cv ? cv.get ( state ) : state
		) ;

		this.el.addEventListener
		(
			type ,
			ev =>
			{
				const v = ( ev.target as any ) [ prop ] ;
				Live.set ( state , cv?.set ( v ) ?? v ) ;
			}
		) ;
	}

	protected setActions ( dec : DD.Actions , passive : boolean ) : void
	{
		for ( const [ type , action ] of Object.entries ( dec ) )
		{
			this.el.addEventListener ( type , action as EventListener , { passive } ) ;
		}
	}

	protected bindFocus ( dec : DD.Focus ) : void
	{
		this.bindState
		(
			dec ,
			state => { this.el.tabIndex = state ? 0 : -1 ; }
		) ;
	}
}

const makeElement = ( ns : string , type : string , dec : DD.ElementSpec < any > ) : DD.TargetDOMElement =>
{
	const rt =
	(
		dec.target ||
		(
			ns ?
				document.createElementNS ( ns , type ) :
				document.createElement ( type )
		)
	) ;
	
	return rt as DD.TargetDOMElement ;
}


class ClassPlace
{
	constructor ( protected el : Element , ) {}

	set classNames ( class_names : string )
	{
		const rem = this.#_prev ;
		const mow = ClassPlace.to_set ( class_names ) ;

		this.el.classList.remove ( ... rem .difference ( mow ) ) ;
		this.el.classList.add ( ... mow ) ;

		this.#_prev = mow ;
	}

	#_prev = new Set < string > ;

	static to_set ( class_names : string ) : Set < string >
	{
		const set = new Set ( class_names.split ( /\s+/g ) ) ;
		set.delete ( "" ) ;
		return set ;
	}
}

const setAttribute = ( ns : string , el : Element , name : string , value : any ) : void =>
{
	if ( value == null )
	{
		ns ? el.removeAttributeNS ( ns , name ) : el.removeAttribute ( name ) ;
	}

	else  ns ? el.setAttributeNS ( ns, name , value ) : el.setAttribute ( name , value ) ;
}

/*　BB 双方向バインド用 string <-> number 相互変換  */
const sncv =
{
	set ( v : string ) { return Number ( v ) } ,
	get ( v : number ) { return String ( v ) }
} ;

