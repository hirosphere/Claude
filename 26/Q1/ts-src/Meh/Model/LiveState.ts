import { Life , refs , life_add_ref , life_remove_ref , Agg , agg , agg_echan } from "./Life.js" ;

const log = console.log ;

/* ---- LiveState ----  */

export const ls_set = Symbol () ;
export const ls_get = Symbol () ;
export const ls_notify = Symbol () ;
const ls_trans = Symbol () ;
const ls_trans_r = Symbol () ;


/* Main */

export function Live < V > ( newv : V , agg ? : Agg ) : Live < V >
{
	return new Live.Leaf ( newv , agg ) ;
}

export type Live < V > = Live.R < V > & Plain < V > &
{
	$ : V ;
	set ( val : V , ch ? : object ) : void ;
	trans < TR > ( tr : Live.trans < TR , V > ) : Live < TR > ;
}

export namespace Live   /* Readonly */
{
	export type R < V > = Plain.R < V > &
	{
		readonly $ : V ;

		add_ref ( ref : Ref ) : void ;
		remove_ref ( ref : Ref ) : void ;

		trans_r < TR > ( tr : Live.trans_r < TR , V > ) : R < TR > ;
	}

	export namespace R
	{
		/* helper types */

		export type str = R < string > ;
		export type num = R < number > ;
		export type bool = R < boolean > ;

		export type ll < V > = R < V > | V ;
		
		export namespace ll
		{
			export type str = R < string > | string ;
			export type num = R < number > | number ;
			export type bool = R < boolean > | boolean ;	
		}
	}
}

export namespace Live
{
	/* helper types */

	export type str = Live < string > ;
	export type num = Live < number > ;
	export type bool = Live < boolean > ;

	export type ll < V > = Live < V > | V ;

	export namespace ll
	{
		export type str = Live < string > | string ;
		export type num = Live < number > | number ;
		export type bool = Live < boolean > | boolean ;	
	}

	/* Refference */

	export type Ref = Life.Ref &
	{
		vChan ( i : { changer : object | undefined , initial : boolean } ) : void ; 
	}
}




/* Plain */

export namespace Live
{
	export const set     = < T > ( ls : Plain   < T > , newv : T , ch ? : object ) : void => ls [ ls_set ] ( newv , ch ) ;
	export const get     = < T > ( ls : Plain.R < T > ) : T => ls [ ls_get ] () ;
	export const mute    = < T > ( ls : Plain   < T > , m : ( v : T ) => T , ch ? : object ) => { set ( ls , m ( get ( ls ) ) , ch ) }

	export const trans   = < R , T  > ( ls : Plain < T > , tr : Live.trans < R , T > ) =>    ls [ ls_trans ] ( tr ) ;
	export const trans_r = < R , T  > ( ls : Plain < T > , tr : Live.trans_r < R , T > ) =>    ls [ ls_trans_r ] ( tr ) ;

	export const add_ref    = < T > ( ls : Plain.R < T > , ref : Live.Ref ) => Life.add_ref ( ls , ref ) ;
	export const remove_ref = < T > ( ls : Plain.R < T > , ref : Live.Ref ) => Life.remove_ref ( ls , ref ) ;

	export const ru = Life.ru ;
}

export type Plain < V > = Plain.R < V > &
{
	[ ls_set ] ( newv : V , ch ? : object ) : void ;
	[ ls_trans ] < TR > ( tr : Live.trans < TR , V > ) : Live < TR > ;
}

export namespace Plain
{
	export type R < V > = Life < Live.Ref > &
	{
		[ ls_get ] () : V ;
		[ ls_trans_r ] < TR > ( tr : Live.trans_r < TR , V > ) : Live.R < TR > ;
	}
}



export namespace Live
{
	export abstract class Core < V >  extends Life < Ref >  implements Live < V >
	{
		/* LS */

		public add_ref ( ref : Ref ) : void { this [ life_add_ref ] ( ref ) ; }
		public remove_ref ( ref : Ref ) : void { this [ life_remove_ref ] ( ref ) ; }

		public set $ ( newv : V ) { this [ ls_set ] ( newv ) ; }
		public get $ () : V  { return this [ ls_get ] () ; }

		public set ( newv : V , ch : object ) { this [ ls_set ] ( newv , ch ) ; }
		public get () : V  { return this [ ls_get ] () ; }

		public trans < TR > ( tr : trans < TR , V > ) : Live < TR > { return this [ ls_trans ] ( tr ) ; }
		public trans_r < TR > ( tr : trans_r < TR , V > ) : R < TR > { return this [ ls_trans_r ] ( tr ) ; }


		/* Plain */

		public override [ life_add_ref ] ( ref : Ref ) : void
		{
			super [ life_add_ref ] ( ref ) ;
			ref.vChan ( { changer : undefined , initial : true } ) ;
		}

		public abstract [ ls_set ] ( newv : V , ch ? : object ) : void ;
		public abstract [ ls_get ] () : V ;

		public [ ls_trans ] < TR > ( tr : trans < TR , V > ) : Live < TR >
		{
			return new Trans < TR , V > ( this , tr ) ;
		}

		public [ ls_trans_r ] < TR > ( tr : trans_r < TR , V > ) : Live.R < TR >
		{
			return new Trans < TR , V > ( this , tr ) ;
		}

		protected [ ls_notify ] ( changer : object | undefined ) : void
		{
			this [ refs ] .forEach ( ref => ref.vChan ( { changer , initial : false } ) ) ;
			this [ agg ] && ( changer != this [ agg ] ) && this [ agg ] [ agg_echan ] () ;
		}
	}

	/* Leaf */

	export class Leaf < T >  extends Core < T >
	{
		constructor ( newv : T , agg ? : Agg )
		{
			super ( agg ) ;
			this.#_value = newv ;
		}

		public override [ ls_set ] ( val : T , ch ? : object ) : void
		{
			if ( val === this.#_value )  return ;
			this.#_value = val ;
			this [ ls_notify ] ( ch ) ;
		}

		public override [ ls_get ] () : T
		{
			return this.#_value ;
		}

		#_value : T ;
	}

	export class Trans < T , S >  extends Core < T >
	{
		constructor ( src : Core < S > , tr : trans_x < T , S > , agg ? : Agg )
		{
			super ( agg ) ;
			this.#_trans = typeof tr == "function" ? { get : tr } : tr ;
			this.#_src = src ;
			src [ life_add_ref ] ( this.#_ref ) ;
		}

		public override [ ls_set ] ( newv : T , ch ? : object ) : void
		{
			if ( ! this.#_trans.set )  return ;

			this.#_src [ ls_set ]
			(
				this.#_trans.set ( newv ) ,
				ch
			) ;
		}

		public override [ ls_get ] () : T
		{
			return this.#_trans.get ( this.#_src [ ls_get ] () ) ;
		}


		#_src : Core < S > ;
		#_ref : Ref = { vChan : ( ch ) => this [ ls_notify ] ( ch ) }
		#_trans : trans < T , S > ;
	}

	export type trans < T , S > =
	{
		get : ( val : S ) => T ;
		set ? : ( val : T ) => S ;
	}

	export type trans_r < T , S > = ( val : S ) => T ;
	export type trans_x < T , S > = trans < T , S > | trans_r < T , S > ;
}

