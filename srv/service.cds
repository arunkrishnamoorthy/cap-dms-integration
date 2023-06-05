using {com.dms as dms} from '../db/schema';

service DmsService {
    entity TRS_HEADER as projection on dms.TRS_HEADER;
}