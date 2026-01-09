import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ReceiptliApi implements ICredentialType {
    name = 'ReceiptliApi';
    displayName = 'Text Extractor API';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            default: '',
            required: true,
            typeOptions: {
                password: true,
            },
        },
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'http://localhost:3000',
            required: true,
        },
    ];
}
