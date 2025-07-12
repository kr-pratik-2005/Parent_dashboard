import os

class Config:
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')  # your Gmail address
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')  # your Gmail app password
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_USERNAME')
