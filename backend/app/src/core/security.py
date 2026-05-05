import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import ExpiredSignatureError, jwt
from passlib.context import CryptContext

from app.src.core.constants import Constants
from app.src.exceptions.domain_exceptions import DomainJWTExpiredError, DomainJWTInvalidError

constants = Constants()


class AppSecurity:
    
    __context = CryptContext(schemes=["argon2"], deprecated="auto")
    
    @classmethod
    def hash_plain_password(cls, plain_password):
        
        # return the plain password if it's empty
        if not plain_password:
            return plain_password
        
        # then hash the password and remove the leading and trailing spaces
        return cls.__context.hash(plain_password.strip())
    
    @classmethod
    def verify_hash_password(cls, plain_password, hashed_password):
        """
        This function is the verify if the inputted password is match to the hashed password.
        :param plain_password: is a user input.
        :param hashed_password: the hashed password.
        :return: True,if matched, otherwise False.
        """
        # return false if the hashed password is empty.
        if not hashed_password:
            return False
        
        # return false if the plain password is empty.
        if not plain_password:
            return False
        
        # return True if matched, otherwise false
        return cls.__context.verify(plain_password, hashed_password)
    
    @classmethod
    def generate_access_token(cls, *, jti: str, data: dict, exp: int = 0):
        """

        This function is to generate an access token.
        :param jti: is the unique identifier of a token.
        :param data: is the data to encrypt in the token.
        :param exp: short for expiration. This is how long the token can use.
        :return: access token.

        """
        to_encode = data.copy()
        # 5 min is the default life of token if not specified the exp parameter.
        expiration = datetime.now(timezone.utc) + timedelta(minutes=5) if exp <= 0 else datetime.now(
                timezone.utc) + timedelta(seconds=exp)
        
        to_encode.update({"jti": jti, "exp": expiration})
        
        access_token = jwt.encode(to_encode, key=constants.JWT_KEY, algorithm=constants.JWT_ALGORITHM)
        return access_token
    
    @staticmethod
    def decode_jwt_token(token: str, verify_exp=True):

        try:
            if not token:
                raise DomainJWTInvalidError(message="Invalid token, cannot validate. Please back to login.")
            
            # decode the token
            payload = jwt.decode(token, key=constants.JWT_KEY, algorithms=[constants.JWT_ALGORITHM],
                                 options={'verify_exp': verify_exp})
            
            if not payload:
                # then raise an exception
                raise DomainJWTInvalidError("Couldn't validate token credentials. Please back to login.")
            # return the data
            return payload
        except ExpiredSignatureError:
            raise DomainJWTExpiredError("Your token is expired. Please back to login.")
        except Exception as e:
            raise e
   
    
    @staticmethod
    def hash_token(token: str):
        return hashlib.sha256(token.encode()).hexdigest()
