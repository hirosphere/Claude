import { IDB } from "./web-db.js" ;

const log = console.log ;

export class KVS < C >
{
	protected db : DB < C > ;

	constructor ( public readonly db_name : string )
	{
		this.db = new DB ( db_name ) ;
	}

	public record
	(
		name : string ,
		ctor : new ( i : Partial < C > ) => C
	
	) : KVS.Record < C >
	{
		return new KVS.Record ( name , this.db.store , ctor ) ;
	}
}

export namespace KVS
{
	export class Record < C >
	{
		constructor
		(
			public readonly name : string ,
			protected store : DB < C > [ "store" ] ,
			protected ctor : new ( i : Partial < C > ) => C
		)
		{}

		public async get () : Promise < C >
		{
			const record = await this.store.get ( this.name ) ;

			return new this.ctor ( record ? record.content : {} ) ;
		}
	}
}

class DB < C > extends IDB
{
	public store : IDB.Store < record < C > , "name" , string > ;

	constructor ( db_name : string )
	{
		super ( { name : db_name , version : 1001 } ) ;
		this.store = new IDB.Store ( this , "STORE" , { keyPath : "name" , autoIncrement : false } ) ;

		this.init () ;
	}
}

type record < C > =
{
	name : string ;
	content : C ;
}


class todo
{
	title : string ;
	items : todo_item [] ;
	
	constructor ( i : Partial < todo > )
	{
		this.title = i.title ?? "" ;
		this.items = i.items ?.map ( e => new todo_item ( e ) ) ?? [] ;
	}
}


class todo_item
{
	title : string ;
	completed : boolean ;

	constructor ( i : Partial < todo_item > )
	{
		this.title = i.title ?? "" ;
		this.completed = i.completed ?? false ;
	}
}


