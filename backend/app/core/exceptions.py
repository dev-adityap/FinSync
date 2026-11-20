class FinSyncError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class InvalidFileError(FinSyncError):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=400)


class PayloadTooLargeError(FinSyncError):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=413)


class ConfigurationValidationError(FinSyncError):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=422)