from fastapi import status


class BaseAppExceptions(Exception):
    """This is the base exceptions. You can call this for 500 exceptions."""
    
    def __init__(self, message_status='error',
                 message='Internal server error. Contact developer if the problem persists.',
                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, headers=None):
        self.message_status = message_status
        self.headers = headers
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code, headers)


class DataBaseDataNotFoundException(BaseAppExceptions):
    def __init__(self, message_status='fail', message='The requested data was not found.',
                 status_code=status.HTTP_404_NOT_FOUND, headers=None):
        self.message_status = message_status
        self.headers = headers
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code, headers)


class JWTExpiredException(BaseAppExceptions):
    def __init__(self, message_status='fail', message='Your session has expired. Please log in again.',
                 status_code=status.HTTP_401_UNAUTHORIZED, headers=None):
        if headers is None:
            headers = {'WWW-Authenticate': 'Bearer'}
        self.message_status = message_status
        self.headers = headers
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code, headers)


class JWTInvalidException(BaseAppExceptions):
    def __init__(self, message_status='fail', message='Invalid token, please login again.',
                 status_code=status.HTTP_401_UNAUTHORIZED, headers=None):
        self.message_status = message_status
        self.headers = {'WWW-Authenticate': 'Bearer'}
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code, headers)


class DataForbiddenException(BaseAppExceptions):
    def __init__(self, message_status='fail',
                 message="Access forbidden. You don’t have permission to perform this action.",
                 status_code=status.HTTP_403_FORBIDDEN, headers=None):
        self.message_status = message_status
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code)


class UnAuthorizeAccessException(BaseAppExceptions):
    def __init__(self, message_status='fail', message="You are not authorized to access this resource. ",
                 status_code=status.HTTP_401_UNAUTHORIZED, headers=None):
        self.message_status = message_status
        self.headers = {'WWW-Authenticate': 'Bearer'}
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code, headers)


class DataBadRequestException(BaseAppExceptions):
    def __init__(self, message_status='fail', message="Bad request.",
                 status_code=status.HTTP_400_BAD_REQUEST, headers=None):
        self.message_status = message_status
        
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code)


class DataUnProcessableContent(BaseAppExceptions):
    def __init__(self, message_status='fail',
                 message="Signup verification failed. Please re-enter your email.",
                 status_code=status.HTTP_422_UNPROCESSABLE_CONTENT):
        self.message_status = message_status
        
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code)


class DataConflictError(BaseAppExceptions):
    def __init__(self, message_status='fail',
                 message="Conflict error. The data you are trying to create already exists.",
                 status_code=status.HTTP_409_CONFLICT):
        self.message_status = message_status
        self.message = message
        self.status_code = status_code
        super().__init__(message_status, message, status_code)
