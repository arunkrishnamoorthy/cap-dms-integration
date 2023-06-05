const cds = require("@sap/cds");

module.exports = cds.service.impl(async (srv) => {
    const { TRS_HEADER } = srv.entities;
    srv.on("CREATE", TRS_HEADER, async (req) => {
        const cmisService = await cds.connect.to("DMS");
        //  Check if the folder exists. if not create new
        const folderExist = await cmisService.get("/test-folder-ak");
        folderExist ?? await createFolder('test-folder-ak');

        // Upload file in the folder 
        await uploadFile(req.Attachments[0].FILE_CONTENT);
    });

    async function createFolder(sFolder) {
        // https://api.sap.com/api/CreateDocumentApi/path/post_browser__repository_id__root
        const cmisService = await cds.connect.to("DMS");
        const folderData = {
            "cmisaction": "createFolder",   //action: create folder
            "propertyId[0]": "cmis:name",   // cmis:name = sFolder
            "propertyValue[0]": sFolder,
            "propertyId[1]": "cmis:objectTypeId", // 
            "propertyValue[1]": "cmis:folder",
            "succinct": "true"
        };
        const data = getFormPayload(folderData);
        const headers = { "Content-Type": "application/x-www-form-urlencoded" };
        return cmisService.send({ method: "POST", path: "/", data, headers });
    }

    async function uploadFile(binaryContent, filename) {
        const cmisService = await cds.connect.to("DMS");
        const payload = {
            "cmisaction": "createDocument",
            "propertyId[0]": "cmis:name",
            "propertyValue[0]": filename,
            "propertyId[1]": "cmis:objectTypeId",
            "propertyValue[1]": "cmis:document",
            "filename": filename,
            "_charset": "UTF-8",
            "includeAllowableActions": "true",
            "succinct": "true"
        }
        const formData = getFormPayload(payload);
        let buffer = Buffer.from(binaryContent, "base64");
        formData.append("media", buffer, filename);
        const headers = formData.getHeaders();
        const postData = formData.getBuffer();
        return cmisService.send({ method: "POST", path: "/test", data: postData, headers });
    }

    function getFormPayload(object) {
        const formData = new FormData();
        Object.keys(object).forEach(key => formData.append(key, object[key]));
        return formData;
    }

    function dataURItoBlob(dataURI, mimeString = 'image/png') {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURI.split(',')[1]);
        }
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(dataURI.length);
        for (var i = 0; i < dataURI.length; i++) {
            ia[i] = dataURI.charCodeAt(i);
        }
        return new Blob([ia], { type: mimeString });
    }
})