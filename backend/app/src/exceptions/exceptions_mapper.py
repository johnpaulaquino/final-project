from app.src.exceptions.domain_exceptions import (DomainAlreadyExistsError, DomainDeactivatedError,
                                                  DomainError, DomainInvalidCredentialsError, DomainNotActivatedError,
                                                  DomainNotFoundError,
                                                  DomainOTPExpiredError, DomainOTPInvalidError, DomainOTPNotExpireError,
                                                  DomainUnAuthorizedError, DomainUnprocessableEntityError, )
from app.src.exceptions.http_exceptions import (DataBadRequestException, DataConflictError, DataForbiddenException,
                                                DataUnProcessableContent, )

EXCEPTION_MAPPER = {
        DomainNotFoundError           : lambda e: DataBadRequestException('Account not found', message=str(e)),
        DomainAlreadyExistsError      : lambda e: DataConflictError('Account already exists', message=str(e)),
        DomainOTPNotExpireError       : lambda e: DataBadRequestException("OTP not expired", message=str(e)),
        DomainDeactivatedError        : lambda e: DataBadRequestException('Account deactivated', message=str(e)),
        DomainOTPInvalidError         : lambda e: DataBadRequestException('Invalid OTP', message=str(e)),
        DomainOTPExpiredError         : lambda e: DataBadRequestException(message_status='OTP Expired', message=str(e)),
        DomainInvalidCredentialsError : lambda e: DataBadRequestException(message_status='Invalid Credentials',
                                                                          message=str(e)),
        DomainNotActivatedError       : lambda e: DataForbiddenException(message_status='Account not verified',
                                                                         message=str(e)),
        DomainUnAuthorizedError       : lambda e: DataForbiddenException(message_status='Invalid Sign-in type',
                                                                         message=str(e)),
        DomainUnprocessableEntityError: lambda e: DataUnProcessableContent(message_status='Unprocessable Entity',
                                                                           message=str(e)),
        DomainError                   : lambda e: DataBadRequestException(message_status='Domain error',
                                                                          message=str(e)),
        }
