#!/usr/bin/env python
import sys
sys.path.insert(0, '/app')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.services.authService import AuthService
from app.schemas.authSchema import RegisterRequest
from core.config.settings import get_settings
from app.models.user import User

settings = get_settings()
engine = create_engine(settings.database_url)
Session = sessionmaker(bind=engine)
db = Session()

try:
    # Check if test user already exists
    existing = db.query(User).filter(User.email == 'test@craftbridge.com').first()
    if existing:
        print('Test user already exists')
    else:
        # Create test user using the auth service
        payload = RegisterRequest(
            email='test@craftbridge.com',
            password='Test123456!',
            first_name='Test',
            last_name='Artisan',
            role='artisan'
        )
        user = AuthService.register(db=db, payload=payload)
        print(f'Test user created successfully: {user.email}')
except Exception as e:
    print(f'Error: {str(e)}')
    import traceback
    traceback.print_exc()
finally:
    db.close()
