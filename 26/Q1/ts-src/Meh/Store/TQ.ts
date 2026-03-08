import { Ease , Branch } from "../Model/Model.js" ;

type todo =
{
	type : "todo"  ;
	completed : boolean ;
}

type dodo =
{
	type : "dodo"  ;
	succeed : boolean ;
}

( s : Ease < todo | dodo > ) =>
{

	if ( s.type == "dodo" )  s.succeed.$ = true ;
	if ( s.type == "todo" )  s.completed.$ = true ;

}


