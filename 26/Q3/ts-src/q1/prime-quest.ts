import { lf_refs , lf_sub , lf_unsub , lf_agg , lf_term , lv_get , lv_set } from "../Meh/Model/symbols.js" ;
import { Agg , Life , monitor } from "../Meh/Model/Life.js" ;
import { Live } from "../Meh/Model/Live.js" ;

const log = console.log ;

const ecr = ( agg : Element , type : string , a ? : { text ? : string , class ? : string } ) =>
{
	const e = document.createElement ( type ) ;
	if ( a ?.text !== undefined )  e.textContent = a.text ;
	if ( a ?.class ) e.className = a.class ;
	agg.appendChild ( e ) ;
	return e ;
}

namespace LiveQuest
{
	( lv : Live < string > ) =>
	{
		Live.set ( lv , "" ) ;
	//	         lv.$ = "" ;

		Live.sub ( lv , { vchan : v => console.log ( v ) } ) ;

		lv [ lf_sub ] ( { vchan : v => console.log ( v ) } ) ;

	//	         lv.sub ( vchan : v => console.log ( v ) } ) ;
	}
}

namespace TransQuest
{
	export const App = ( com : Element ) =>
	{
		const lv = Live.create ( 0.1 ) ;

		const e = ecr ( com , "article" , { class : "FC PX GX" } ) ;

		ecr ( e , "h2" , { text : "Trans" } ) ;

		Range ( e , lv ) ;
	}

	const Range = ( com : Element , liv : Live < number > , p ? : {  } ) =>
	{
		const pc = Live.trans ( liv , { get : v => v * 100 , set : v => v / 100 } ) ;
		const label_pc = Live.trans ( liv , s => ( Live.get ( liv ) * 100 ).toFixed ( 0 ) + " %" ) ;

		const e = ecr ( com , "span" , { class : "RANGE  FR PX GX AC" } ) ;
		const inp = ecr ( e , "input" ) as HTMLInputElement ;
		inp.type = "range" ;
		inp.style.width = "240px" ;
		inp.max = "100" ;

		Live.sub ( pc , { vchan : v => inp.valueAsNumber = v } ) ;
		inp.oninput = () => Live.set ( pc , inp.valueAsNumber ) ;

		Label ( e , label_pc ) ;
	}

	const Label = ( com : Element , liv : Live < any > ) =>
	{
		const e = ecr ( com , "span" , ) ;

		Live.sub ( liv , { vchan : v => e.textContent = v } ) ;
	}
}

namespace AggQuest
{
	export const App = ( com : Element ) =>
	{
		const e = ecr ( com , "article" ) ;

		ecr ( e , "h2" , { text : "Cube - Agg" } ) ;
	}
}


const App = () =>
{
	const e = ecr ( document.body , "div" , { class : "FC PX GX" } ) ;
	ecr ( e , "h1" , { text : "Prime Quest - " + new Date ().toLocaleString () } ) ;
	
	TransQuest.App ( e ) ;
	AggQuest.App ( e ) ;
}

App () ;
