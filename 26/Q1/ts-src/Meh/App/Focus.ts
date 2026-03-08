import { Order } from "../Meh.js" ;

export class Focus
{
	set ( o : Order < any > | undefined ) : void
	{}

	[ "Shift" ] ? : Focus.keyaction ;
}

export namespace Focus
{
	export type keyaction = ( args : keydownargs ) => void ;

	type keydownargs =
	{
		focus : Focus ;
		o : Order < any > ;
		key : string ;
		m : modifier ;
		event : KeyboardEvent ;
	}

	const modifiers = [ "" , "Shift" , "Ctrl" , "Ctrl+Shift" , "Alt" , "Alt+Shift" , "Alt+Ctrl" , "Alt+Ctrl+Shift" ] as const ;
	export type modifier = typeof modifiers [ number ] ;

	export class Item
	{
		keydown ? : keyaction ;
	}
}

const m : Focus.keyaction = ( { focus , o , key , m , event : ev } ) : void =>
{
	if ( m == "" ) switch ( key )
	{
		case "ArrowUp" : focus.set ( o.prev ?? o ) ; break ;
		case "ArrowDown" : focus.set ( o.next ?? o ) ; break ;
		
		default : return ;
	}

	else if ( m == "Shift" ) switch ( key )
	{
		default : return ;
	}

	else if ( m == "Ctrl+Shift" ) switch ( key )
	{
		default : return ;
	}

	ev.preventDefault () ;
	ev.stopPropagation () ;
}

