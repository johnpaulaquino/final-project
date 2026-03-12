class DomainError(Exception):
    """This is the base error for domain."""
    
    def __init__(self, message='Internal server error. Contact developer if the problem persists.'):
        super().__init__(message)


# Authentication / Authorization
class DomainInvalidCredentialsError(DomainError):
    """
    This error is for user invalid credentials. You can use this when the user input is invalid.
     For example, when the user input is empty or the user input is not in the correct
     format. This error is for user input error. You can use this when the user input is invalid.
     For example, when the user input is empty or the user input is not in the correct
     format.
    """
    pass


class DomainNotActivatedError(DomainError):
    pass


class DomainForbiddenAccessError(DomainError):
    pass


# Data Validation

class DomainAttributeError(DomainError):
    pass


class DomainInvalidFormatError(DomainError):
    pass


class DomainLargeFileError(DomainError):
    pass


class DomainInvalidSignInType(DomainError):
    pass


# JWT Error
class DomainJWTExpiredError(DomainError):
    pass


class DomainJWTInvalidError(DomainError):
    pass


# OTP Error
class DomainOTPNotExpireError(DomainError):
    pass


class DomainOTPInvalidError(DomainError):
    pass


class DomainOTPExpiredError(DomainError):
    pass


# Entity error
class DomainUnprocessableEntityError(DomainError):
    pass


class DomainNotFoundError(DomainError):
    pass


class DomainAlreadyExistsError(DomainError):
    pass


class DomainDeactivatedError(DomainError):
    pass


class DomainEntityStatusInvalidError(DomainError):
    pass
