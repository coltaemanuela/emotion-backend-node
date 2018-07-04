module.exports = {
    errors: {
        'internal_error' : {
            code    : 501,
            msg     : 'There was an internal error.'
        },
        'invalid_token' : {
            code    : 502,
            msg     : 'Invalid Token.'
        },
        'miss_req_params' : {
            code    : 503,
            msg     : 'Required params are missing.'
        },
        'user_not_found' : {
            code    : 504,
            msg     : 'User not found. Email or password are wrong.'
        },
        'user_existing' : {
            code    : 505,
            msg     : 'Existing user.'
        },
        'minim_string_length' : {
            code    : 506,
            msg     : 'The title is too short.'
        },
        'password_do_not_match' : {
            code    : 507,
            msg     : 'The passwords do not match.'
        },
        
        'recording_not_found' : {
            code    : 508,
            msg     : 'Recording not found'
        },
        'email_is_empty' : {
            code    : 509,
            msg     : 'Email is empty'
        },
        'text_document_not_found' : {
            code    : 510,
            msg     : 'Text document not found'
        },
       
        'no_user_for_user_id' : {
            code    : 511,
            msg     : 'The user was not found'
        },
        'recording_title_min_length' : {
            code    : 512,
            msg     : 'Recording title is to short.'
        },
     
        'duplicate_data' : {
            code    : 513,
            msg     : 'Duplicate data found.'
        },
        'validation_errors' : {
            code    : 514,
            msg     : 'Missing or incorrect values'
        }
    },

    send : function( status, data ){

        return {
            status	: status,
            data	: data,
            jwt : "" // this will appended at the end of any endpoint from routes/api.js
        }

    },

    customError : function( msg ){
        
        var status = {
            code    : 500,
            msg     : msg
        }

        return this.send( status, null );
    },

    success : function( data ){
        
        var status = {
            code    : 200,
            msg     : null
        }

        return this.send( status, data );
    },

    successWithJwt: function(jwt){
        return {
            status	: { code: 200, msg: null},
            data	: '',
            jwt     : jwt
        }
    },

    errorCode : function( id ){
        
        return this.errors[id] ? this.send( this.errors[id], null ) : this.customError(id);

    }

};