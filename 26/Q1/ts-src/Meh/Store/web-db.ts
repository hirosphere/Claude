const log = console.log ;

export type DBSchema =
{
	name : string ;
	version : number ;
}

export type SP < K > =
{
	keyPath ? : K ;
	autoIncrement ? : boolean ;
} ;

export class IDB
{
	public readonly stores = new Map < string , IDB.Store < any , any , any > > ;
	public get core () : IDBDatabase | undefined { return this.#_core ; }

	constructor ( public readonly schema : DBSchema )
	{}

	public init () : void
	{
		try
		{
			const oreq = indexedDB.open ( this.schema.name , this.schema.version ) ;

			oreq.onsuccess = ev =>
			{
				this.#_core = oreq.result ;
				this.#_available = true ;

				this.on_init () ;
				this.#_inits.forEach ( oper => oper () ) ;
			}
		
			oreq.onupgradeneeded = ev =>
			{
				log ( "upgrade" , ev ) ;
				make_store ( oreq.result , this.stores ) ;
			}
		
			oreq.onerror = ev =>
			{
				log ( "IDB init onerror" , ev ) ;
			}
		}
		catch ( err )
		{
			log ( err ) ;
		}
	}

	public set inits ( oper : () => void )
	{
		if ( this.#_available ) oper () ;
		else  this.#_inits.push ( oper ) ;
	}

	#_core ? : IDBDatabase ;
	#_available = false ;
	#_inits : ( () => void ) [] = [] ;

	protected on_init () : void {}
}

const make_store = ( db : IDBDatabase , stores : Map < string , IDB.Store < any , any , any > > ) =>
{
	stores.forEach
	(
		store =>
		{
			if ( db.objectStoreNames.contains ( store.name ) == false )
			{
				db.createObjectStore ( store.name , store.param ) ;
				log ( "IDB : ストア作成" , store.name ) ;
			}
		}
	)
}

export namespace IDB
{
	export class Store < R extends object , K extends keyof R , KT extends ( number | string ) >
	{
		constructor ( protected db : IDB , public readonly name : string , public readonly param : SP < K > )
		{
			db.stores.set ( name , this ) ;
		}
	
		public add ( value : Omit < R , K > , tr ? : IDBTransaction ) : void
		{
			const db = this.db.core ;
			if ( ! db )  return ;

			tr ??= db.transaction ( [ this.name ] , "readwrite" ) ;
			const req = tr.objectStore ( this.name ) .add ( value ) ;
			
			req.onsuccess = () => log ( this.name , "add" , value )
		}
	
		public set ( value : R , tr ? : IDBTransaction ) : boolean
		{
			const db = this.db.core ;
			if ( ! db )  return false ;

			tr ??= db.transaction ( [ this.name ] , "readwrite" ) ;
			const req = tr.objectStore ( this.name ) .put ( value ) ;
			req.onsuccess = () => log ( this.name , "set" , value ) ;
			
			return true ;
		}
	
		public async get ( key : KT , tr ? : IDBTransaction ) : Promise < R | undefined >
		{
			const f = ( resolve : ( v : R | undefined ) => void , reject : ( v ? : any ) => void ) =>
			{
				try
				{
					if( ! this.db.core )
					{
						resolve ( undefined ) ;
						return ;
					}

					tr ??= this.db.core.transaction ( [ this.name ] , "readonly" ) ;
					if( ! tr )
					{
						log ( "IDB.Store get" , "transaction がないよ。" ) ;
						resolve ( undefined ) ;
						return ;
					}
	
					const st = tr.objectStore ( this.name ) ;
					const g_req = st.get ( key ) ;

					g_req.onsuccess = ev =>
					{
						log ( "IDB.Store get onsuccess" , g_req.result ) ;
						resolve ( g_req.result ) ;
					}

					g_req.onerror = ev =>
					{
						log ( "IDB.Store get" , "get req エラーだよ。" ) ;
						resolve ( undefined ) ;
					}
				}
	
				catch ( exc )
				{
					log ( "IDB.Store get"  , this.db.schema.name , this.name , exc ) ;
					resolve ( undefined ) ;
				}
			}
	
			return new Promise ( f ) ;
		}
	}
}

