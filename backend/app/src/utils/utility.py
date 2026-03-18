import secrets
import socket
from datetime import date

from starlette import status

from app.src.core.constants import ConstantsData
from app.src.exceptions.domain_exceptions import (DomainOTPExpiredError,
                                                  DomainOTPInvalidError,
                                                  DomainUnprocessableEntityError, )
from app.src.schema import EnvironmentStatus, PaginatedOutput, SuccessfulResponseSchema
from app.src.schema.products_schema import ProductStatusSchema


class Utility:
    
    @staticmethod
    def capitalize_first_letters(words: str):
        try:
            if not words:
                return ""
            # split words
            split_words = words.split(" ")
            
            formatted_word = []
            for word in split_words:
                word = word.strip().lower()
                word = word[:1].capitalize() + word[1:]
                formatted_word.append(word)
            
            return " ".join(formatted_word)
        except Exception as e:
            raise e
    
    @staticmethod
    def config_successful_response(sign_in_type: int):
        
        config = {1: SuccessfulResponseSchema(message="Verification code sent to your email.",
                                              action="EMAIL_SENT",
                                              status_message="accepted",
                                              status_code=status.HTTP_202_ACCEPTED),
                  
                  2: SuccessfulResponseSchema(message="Verification code sent to your email.",
                                              action="EMAIL_SENT",
                                              status_message="accepted",
                                              status_code=status.HTTP_202_ACCEPTED), }
        
        return config.get(sign_in_type)
    
    @staticmethod
    def verify_otp(otp_code_from_redis, otp_code):
        if not otp_code_from_redis:
            raise DomainOTPExpiredError(message="Your code is expired. Please request a new one.", )
        
        if otp_code_from_redis != otp_code:
            
            raise DomainOTPInvalidError(message="Incorrect OTP code.")
    
    @staticmethod
    def find_data_from_list(key: str, dict_data: list, list_of_data):
        """
        This function is to find data from a list using a list of dict.
        :param key:
        :param dict_data:
        :param list_of_data:
        :return:
        """
        
        data = list(filter(lambda x: (x is not None) and x.get(key, "") in list_of_data, dict_data))
        
        return data
    
    @staticmethod
    def get_offset(skip: int, limit: int):
        if skip <= 0:
            skip = 1
        offset = (skip - 1) * limit
        return offset
    
    @staticmethod
    def get_product_status(stock: int, low_stock_threshold: int):
        """
        To get the status of the product base on the stocks and low stock threshold.
        :param stock: The quantity of the products.
        :param low_stock_threshold: To determine when to re-stock.
        :return: The status of th product.
        """
        if stock <= 0:
            return ProductStatusSchema.OUT_OF_STOCK
        elif stock <= low_stock_threshold:
            return ProductStatusSchema.LOW_OF_STOCK
        return ProductStatusSchema.AVAILABLE
    
    @staticmethod
    def validate_image_file_extension(file_name):
        allowed_extensions = ("jpeg", "jpg", "png", "webp")
        if not file_name.lower().endswith(allowed_extensions):
            raise DomainUnprocessableEntityError(message=f'File extension should be in {allowed_extensions}.')
    
    @classmethod
    def is_file_uploaded(cls, img_file):
        """
        To check if there is a file uploaded in the server and check if it is a valid image file.
        :param img_file: To upload in server to check.
        :return: True, if there's a file and valid filename, otherwise False.
        """
        # set flag as not uploaded
        is_file_upload = False
        # check if there's file uploaded in server
        if img_file:
            # check if the size is valid
            if img_file.size > 0:
                try:
                    # validate the image if
                    cls.validate_image_file_extension(img_file.filename)
                    # then set flag as uploaded or True
                    is_file_upload = True
                except Exception as e:
                    # raise error if not valid
                    raise e
        
        return is_file_upload
    
    @staticmethod
    def get_cors():
        ip_add = ''
        if ConstantsData.ENVIRONMENT == EnvironmentStatus.Dev:
            # This is for CORS Middleware
            origins = [
                    'http://localhost:5173',
                    'http://127.0.0.1:5173',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:4040', ]
        else:
            # for production
            origins = [
                    'https://my-personal-portfolio-one-steel.vercel.app',
                    ]
        
        return origins
    
    @staticmethod
    def get_paginated_data(*, offset, skip, limit, total_records) -> PaginatedOutput:
        """
        To get the paginated data.
        """
        curr_page = offset + 1
        end_page = skip * limit
        has_next = True if (total_records - end_page) > 0 else False
        paginated_data = PaginatedOutput(start_page=curr_page, end_page=end_page,
                                         total_records=total_records,
                                         has_next=has_next)
        
        return paginated_data if paginated_data.total_records else None
    
    @classmethod
    def validate_birthdate(cls, birthdate: date):
        """
        To validate birthdate, it ,must be at least 18 years old.
        """
        # date today must not be greater than to today's year
        if not birthdate:
            return 0
        user_age = cls.calculate_age(birthdate)
        if user_age < 18:
            DomainUnprocessableEntityError("Age must be at least 18 years old.")
        
        return user_age
    
    @staticmethod
    def calculate_age(birthday: date):
        """
        A function to calculate user age by specifying the user birthday.
        :param birthday: That is given by the user.
        :return: Age of the user.
        """
        # get today's date
        today_date = date.today()
        # and day,month and year to variables
        t_day, t_month, t_year = today_date.day, today_date.month, today_date.year
        
        # assign day, month and year of user to variable
        user_b_day, user_b_month, user_b_year = birthday.day, birthday.month, birthday.year
        
        # calculate age
        age = t_year - user_b_year
        
        # check if today's month is less than to its birth month
        if t_month < user_b_month:
            age -= 1
        
        # otherwise check today's month if equal to user's birthmonth
        elif t_month == user_b_month:
            # then check if today's day is less than to its birthday
            if t_day < user_b_day:
                # then subtract 1 to its age
                age -= 1
        
        # handle zero and negative value
        if age <= 0:
            age = 1
        # then return age
        return age
    
    @staticmethod
    def generate_otp_code():
        otp = str(secrets.randbelow(900000) + 100000)  # 6-digit
        
        return otp
