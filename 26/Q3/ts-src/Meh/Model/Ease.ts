import { lf_refs, lf_sub , lf_agg , lf_term , lv_get , lv_set, agg_echan } from "./symbols.js" ;
import { Life , Agg } from "./Life.js" ;
import { Live } from "./Live.js" ;

const log = console.log ;


export type Ease < V , $_type = "type" > =
(
	Live < V >
) ;

