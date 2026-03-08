export type unedor < T > = T | undefined ;
export type uned = undefined ;
export const uned = undefined ;

export const log = console.log ;

export function df ( format : string , date : Date = new Date )
{
	return format.replace
	(
		/YYYY|YY|Y|MM|M|DD|D|B|hh|h|mm|m|ss|s|xxxx|x|S|L/g ,
		( m ) => df_table [ m ] ?. ( date ) ?? m
	);
}

function trim ( val : number , dig : number )
{
	return ( val + "" ).padStart ( dig , "0" ).slice ( - dig ) ;
}

const df_table : { [ name : string ] : ( date : Date ) => string } =
{
	"YYYY" : date => trim ( date.getFullYear () , 4 ) ,
	"YY"   : date => trim ( date.getFullYear () , 2 ) ,
	"MM"   : date => trim ( date.getMonth () + 1 , 2 ) ,
	"DD"   : date => trim ( date.getDate () , 2 ) ,

	"Y"    : date => date.getFullYear ()  + "" ,
	"M"    : date => date.getMonth () + 1 + "" ,
	"D"    : date => date.getDate + "" ,

	"B"    : date => youbi [ date.getDay () ] ,

	"hh"   : date => trim ( date.getHours () , 2 ) ,
	"mm"   : date => trim ( date.getMinutes () , 2 ) ,
	"ss"   : date => trim ( date.getSeconds () , 2 ) ,
	"xxxx" : date => trim ( date.getMilliseconds () , 4 ) ,

	"h"   : date => date.getHours () + "" ,
	"m"   : date => date.getMinutes () + "" ,
	"s"   : date => date.getSeconds () + "" ,
	"x"   : date => date.getMilliseconds () + "" ,

	"S"    : date => date.toString () ,
	"L"    : date => date.toLocaleString () ,
} ;

const youbi = [ "日" , "月" , "火" , "水" , "木" , "金" , "土" ] ;

type times_arg = number |
{
	start ? : number ;
	next : number ;
} ;

export function times < R = void > ( arg : times_arg , oper : ( i : number ) => R ) : R []
{
	const n = typeof arg == "number" ;
	const start = n ? 0 : arg.start ?? 0 ;
	const next = n ? arg : arg.next ;

	const rt : R [] = [] ;
	for ( let i = start ; i < next ; i ++ )
	{
		rt.push ( oper ( i ) ) ;
	}
	return rt ;
}

