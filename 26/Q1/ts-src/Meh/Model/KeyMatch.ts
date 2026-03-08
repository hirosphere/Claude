import { Live } from "./LiveState.js" ;

const log = console.log ;

export class Key < K >
{
	constructor
	(
		public readonly key : Live < K >
	)
	{
		this.#_target = this.key.$ ;
		this.key.add_ref ( { vChan : () => this.update () } ) ;
	}

	public match ( key : K ) : Key.Match < K >
	{
		let match = this.#_items.get ( key ) ;

		if ( ! match )
		{
			match = new Key.Match < K > ( this , key ) ;
			this.#_items.set ( key , match ) ;	
		}
		
		return match ;
	}

	/* */

	protected update () : void
	{
		const old_key = this.#_target ;
		const new_key = this.#_target = this.key.$ ;

		this.update_item ( old_key ) ;
		this.update_item ( new_key ) ;
	}

	protected update_item ( key : K ) : void
	{
		const item = this.#_items.get ( key ) ;
		if ( item ) item.$ = key === this.key.$ ;
	}

	#_items = new Map < K , Key.Match < K > > ;
	#_target : K ;
}

export namespace Key
{
	export class Match < K >  extends Live.Leaf < boolean >
	{
		constructor
		(
			protected srv : Key < K > ,
			public readonly key : K ,
		)
		{
			super ( srv.key.$ === key ) ;
		}

		public select () : void
		{
			this.srv.key.$ = this.key ;
		}
	}
}
