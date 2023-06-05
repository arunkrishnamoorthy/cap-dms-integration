namespace com.dms;

entity TRS_HEADER {
    key TRS_ID: String(10);
    Attachments: Composition of many TRS_ATTACHMENT on Attachments._FILE_ID = $self;
}

entity TRS_ATTACHMENT {
    key ID: String(10);
    FILE_NAME: String;
    FILE_CONTENT: LargeBinary; 
    FILE_TYPE: String;
    _FILE_ID: Association to TRS_HEADER;
}