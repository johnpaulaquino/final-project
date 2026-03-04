from typing import Protocol

from pydantic import NameEmail


class EmailInterface(Protocol):
    async def send_email_verification_code(self, recipient: NameEmail | str,
                                           verification_code: int,
                                           subject="Verification Code", ) -> None:
        """Send an email to the specified recipient with the given subject and body."""
    
    ...
