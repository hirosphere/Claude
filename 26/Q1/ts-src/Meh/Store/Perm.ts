
import { Ease } from "../Model/Model.js" ; ;

const log = console.log ;

export class Perm < SD extends StoresDef >
{
	public readonly s : Stores < SD > ;

	constructor ( protected schema : Perm.schema < SD > )
	{
		const ents = Object.entries ( schema.stores ) .map
		(
			( [ name , ctor ] ) => [ name , new Store ( this , name , ctor ) ]
		) ;

		this.s = Object.fromEntries ( ents ) ;
	}

	public async db () : Promise < IDBDatabase | undefined >
	{
		return  this.#_db ??= await this.create_db () ;
	}

	#_db ? : IDBDatabase ;

	protected async create_db () : Promise < IDBDatabase | undefined >
	{
		const fn = ( resolve : ( v : IDBDatabase | undefined ) => void ) : void =>
		{
			try
			{
				const open_req = indexedDB.open
				(
					this.schema.idb_name ,
					this.schema.version * 1000 + 2
				) ;
	
				open_req.onsuccess = ev =>
				{
					// log ( "Perm create_db () open_req onsuccess" , this.schema ) ;

					resolve ( open_req.result ) ;
				}
			
				open_req.onupgradeneeded = ev =>
				{
					log ( "Perm create_db () open_req onupgradeneeded" , this.schema.idb_name ) ;

					const db = open_req.result ;
					make_stores ( db , this.schema.stores ) ;
				}
			
				open_req.onerror = ev =>
				{
					log ( "Perm create_db () open_req onerror" , ev ) ;
					resolve ( undefined ) ;
				}
			}
			
			catch ( exc )
			{
				log ( "Perm create_db () catch" , exc ) ;
			}
		}

		return new Promise ( fn )
	}
}


const make_stores = ( db : IDBDatabase , stores : StoresDef ) : void =>
{
	const oldlist = new Set ( db.objectStoreNames ) ;
	const newlist = new Set ( Object.keys ( stores ) ) ;

	newlist.difference ( oldlist ) .forEach
	(
		storename => db.createObjectStore ( storename )
	) ;

	log ( "new" , newlist.difference ( oldlist ) ) ;
	log ( "old" , oldlist.difference ( newlist ) ) ;
}


export namespace Perm
{
	export type schema < SD extends StoresDef > =
	{
		idb_name : string ,
		version : number ,
		stores : SD ,
	}
}

type Stores < D extends StoresDef > =
{
	[ name in keyof D ] : Store < InstanceType < D [ name ] > > ; 
}

type StoresDef =
{
	[ name : string ] : sd < any >
}

type sd < v > = sd.simple < v > ;

namespace sd
{
	export type tree < v > =
	{
		type : ctor < v > ;
	}

	export type simple < v > = ctor < v > ;

	export type ctor < v > = new ( i ? : dp < v > ) => v ;
	export type dp < v > =
	(
		v extends object ?
			v extends ( infer e ) [] ? dp < e > [] :
			{ [p in keyof v] ? : dp < v[p] > } :
		v
	) ;
}


export class Store < V extends object >
{
	constructor
	(
		protected perm : Perm < any > ,
		public readonly name : string ,
		protected ctor : Ease.ctor < V >
	)
	{}

	public async set ( val : V , id : string ) : Promise < boolean >
	{
		const ok = async ( resolve : ( ok : boolean ) => void ) =>
		{
			try
			{
				const transaction = ( await this.perm.db() ) ?.transaction ( [ this.name ] , "readwrite" ) ;
				if ( ! transaction ) { resolve ( false ) ;  return ; }
	
				const store = transaction.objectStore ( this.name ) ;
	
				const request = store.put ( val , id ) ;
				
				request.onsuccess = ev => resolve ( true ) ;
				request.onerror = () => resolve ( false ) ;	
			}

			catch ( exc )
			{
				resolve ( false ) ;
			}
		}

		return new Promise ( ok ) ;
	}

	public async get ( id : string ) : Promise < V | undefined >
	{
		const val = async ( resolve : ( id : V | undefined ) => void ) =>
		{
			try
			{
				const transaction = ( await this.perm.db() ) ?.transaction ( [ this.name ] , "readonly" ) ;
				if ( ! transaction ) { resolve ( undefined ) ;  return ; }
	
				const store = transaction.objectStore ( this.name ) ;
	
				const request = store.get ( id ) ;
				
				request.onsuccess = ev => resolve ( request.result ) ;
				request.onerror = () => resolve ( undefined ) ;	
			}
			
			catch ( exc )
			{
				resolve ( undefined ) ;
			}
		}

		return new Promise ( val ) ;
	}
}

export class Record < V >
{
	constructor
	(
	//	protected store : Store < V > ,
		public readonly id : string ,
	)
	{}
}


class tree
{
	root ? : node ;
	nodes = new Map < number , node > ;
	next_node_id = 1 ;
}


class node
{
	id : number ;
	agg  : number ;
	parts ? : number [] ;

	name : string ;
	cr : string ;
	mod : string ;

	constructor ( i : node )
	{
		this.id = i.id ;
		this.agg = i ?.agg ?? 0 ;
		this.parts = i ?.parts ;

		this.name = i.name ;
		this.cr = i.cr ?? new Date () .toISOString () ;
		this.mod = i.mod ?? this.cr ;
	}
}




class main
{
	type : string ;

	constructor ( i ? : main )
	{
		this.type = i ?.type ?? "" ;
	}
}

class todo
{
	type : "todo" = "todo" ;
	title : string ;
	completed : boolean ;

	constructor ( i ? : todo )
	{
		this.title = i ?.title ?? "" ;
		this.completed = i ?.completed ?? false ;
	}
}

