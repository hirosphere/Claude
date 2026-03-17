
export interface Class  extends Node
{
	type : "class" ;
	name : string ;
	public ? : Method [] ;
}

export interface Method  extends Node
{
	type : "method" ;
	name : string ;
}

export interface Node
{
	type : string ;
}

