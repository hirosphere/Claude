/* Renn の Order をキーとした選択・フォーカスシステム */

import { Live , Renn , Order } from "../Model/Model.js" ;

type ud = undefined ;
const ud = undefined ;

class RennSelector < T >
{
	constructor
	(
		public readonly curr : Live < Order < T > | ud > ,
	)
	{}

	public set ( o : Order < T > | ud = ud ) : void
	{
		this.curr.$ = o ;
	}
}

class Item < T >
{
	constructor
	()
	{}

	protected keydown (  ) : void {}

}


