import { SetMetadata } from '@nestjs/common';
import { RESPONSE_MESSAGE_KEY, SKIP_TRANSFORM_KEY } from '../../utils/app.utils.js';


// @ResponseMessage('User created successfully')
export const ResponseMessage = ( message: string ) =>
    SetMetadata( RESPONSE_MESSAGE_KEY, message );

// @SkipTransform(): for health checks, file downloads, streams, webhooks
export const SkipTransform = () => SetMetadata( SKIP_TRANSFORM_KEY, true );