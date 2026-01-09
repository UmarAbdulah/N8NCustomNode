import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

export class Receiptli implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Receiptli',
        name: 'receiptli',
        icon: 'file:receiptli.svg',
        group: ['transform'],
        version: 1,
        description:
            'Automatically parse forms, resumes, and invoices using AI. Turn unstructured documents into structured insights — no templates required.',
        defaults: { name: 'Receiptli' },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'ReceiptliApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Binary Property Name',
                name: 'binaryPropertyName',
                type: 'string',
                default: 'data',
                description: 'Name of the binary property containing the uploaded file',
                required: true,
            },
            {
                displayName: 'Schema (JSON)',
                name: 'schema',
                type: 'string',
                default: '',
                typeOptions: { rows: 6 },
                required: true,
            },
            {
                displayName: 'Language',
                name: 'language',
                type: 'options',
                options: [
                    { name: 'English', value: 'eng' },
                    { name: 'Arabic', value: 'ar' },
                ],
                default: 'eng',
                required: false,
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const credentials = await this.getCredentials('ReceiptliApi');
        const baseUrl = credentials.baseUrl as string;
        const apiKey = credentials.apiKey as string;

        for (let i = 0; i < items.length; i++) {
            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
            const schema = this.getNodeParameter('schema', i) as string;
            const language = this.getNodeParameter('language', i) as string;

            if (!items[i].binary || !items[i].binary![binaryPropertyName]) {
                throw new Error(
                    `No binary data found on property "${binaryPropertyName}". Ensure previous node provides a file.`
                );
            }

            const binaryData = items[i].binary![binaryPropertyName];
            const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

            const response = await this.helpers.request({
                method: 'POST',
                url: `${baseUrl}/api/v1/extract-text`,
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                formData: {
                    file: {
                        value: fileBuffer,
                        options: {
                            filename: binaryData.fileName || 'document.pdf',
                            contentType: binaryData.mimeType || 'application/pdf',
                        },
                    },
                    schema,
                    language,
                },
                json: true,
                timeout: 3600000,
            });

            returnData.push({ json: response });
        }
        return [returnData];
    }
}
