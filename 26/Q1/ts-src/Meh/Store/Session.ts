import { Ease } from "../Model/Ease.js" ;

const log = console.log ;

export class Session < V extends object >
{
	public readonly value : Ease < V > ;

	constructor
	(
		public readonly name : string ,
		ctor : Ease.ctor < V > ,
	)
	{
		const json = sessionStorage.getItem ( name ) ;
		this.value = parse < V > ( ctor , json ?? "" ) ;

		log ( "Store.Session ctor data : " , this.value.$ ) ;

		window.addEventListener
		(
			"beforeunload" ,
			() => this.save ()
		) ;
	}

	public save () : void
	{
		const json = JSON.stringify ( this.value.$ ) ;

		log ( "SS save " , this.value.$ ) ;

		sessionStorage.setItem ( this.name , json ) ;
	}
}

function parse < V extends object >
(
	ctor : Ease.ctor < V > ,
	json : string

) : Ease < V >
{
	try
	{
		const data = JSON.parse ( json ) ;
		return Ease.fromPartial < V > ( data , ctor ) ;
	}
	catch ( exc ) {}

	return Ease < V > ( new ctor ) ;

}
