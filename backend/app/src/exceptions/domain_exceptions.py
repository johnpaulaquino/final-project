class DomainError(Exception):
    """This is the base error for domain."""
    
    def __init__(self, message='Internal server error. Contact developer if the problem persists.'):
        super().__init__(message)


class DomainNotFoundError(DomainError):
    pass


class DomainAlreadyExistsError(DomainError):
    pass


class DomainDeactivatedError(DomainError):
    pass


class DomainOTPNotExpireError(DomainError):
    pass


class DomainOTPInvalidError(DomainError):
    pass


class DomainOTPExpiredError(DomainError):
    pass


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


class DomainUnAuthorizedError(DomainError):
    pass


class DomainUnprocessableEntityError(DomainError):
    pass


class DomainAttributeError(DomainError):
    pass


class DomainInvalidFormatError(DomainError):
    pass


class DomainLargeFileError(DomainError):
    pass


class DomainJWTExpiredError(DomainError):
    pass


class DomainJWTInvalidError(DomainError):
    pass
