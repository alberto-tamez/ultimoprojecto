# Use absolute imports to avoid module not found errors
import sys
from pathlib import Path

# Ensure parent directory is in path - pure function approach
if str(Path(__file__).parent.parent) not in sys.path:
    sys.path.append(str(Path(__file__).parent.parent))

# Now import modules
import models
from auth import get_current_user

def test_create_log_for_current_user(client, db_session, mock_current_user):
    """
    Goal: Verify that POST /logs/ correctly creates a Log entry associated
          with the authenticated user's ID.
    
    Setup: A valid authenticated user (provided by `mock_current_user` fixture).
    Action: Call the POST /logs/ endpoint.
    Assertion: 
        1. The HTTP response is successful (200 OK).
        2. The response body contains the correct data, including the user_id.
        3. A 'Log' record exists in the database with the correct user_id.
        4. An 'ActivityLog' record for this action is created in the database.
    """
    # Action
    response = client.post(
        "/logs/",
        json={"type": "user_action", "message": "User performed an action."}
    )

    # Assertions
    assert response.status_code == 200
    log_data = response.json()
    assert log_data["message"] == "User performed an action."
    assert log_data["user_id"] == mock_current_user.id

    # Verify database state
    db_log = db_session.query(models.Log).filter(models.Log.id == log_data["id"]).one()
    assert db_log is not None
    assert db_log.user_id == mock_current_user.id
    
    activity_log = db_session.query(models.ActivityLog).filter(
        models.ActivityLog.details == "Created log of type user_action"
    ).one()
    assert activity_log is not None
    assert activity_log.user_id == mock_current_user.id

def test_read_logs_as_non_admin(client, db_session, mock_current_user):
    """
    Goal: Verify that a non-admin user can only retrieve their own logs.
    
    Setup: 
        - Create a log for the current user (ID=1).
        - Create a log for another user (ID=2).
    Action: Call GET /logs/.
    Assertion: The response contains only the log for the current user.
    """
    # Setup
    db_session.add(models.Log(type="test", message="My log", user_id=mock_current_user.id))
    db_session.add(models.Log(type="test", message="Other user's log", user_id=99))
    db_session.commit()

    # Action
    response = client.get("/logs/")

    # Assertions
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) == 1
    assert logs[0]["message"] == "My log"
    assert logs[0]["user_id"] == mock_current_user.id

def test_read_logs_as_admin(client, db_session, test_app):
    """
    Goal: Verify that an admin user can retrieve all logs.
    
    Setup: 
        - Override the `get_current_user` dependency to return an admin user.
        - Create logs for multiple users.
    Action: Call GET /logs/.
    Assertion: The response contains logs from all users.
    """
    # Setup - Create an admin user and override the dependency
    admin_user = models.User(id=1, email="admin@test.com", is_admin=True)
    test_app.dependency_overrides[get_current_user] = lambda: admin_user
    
    # Setup - Create logs
    db_session.add(models.Log(type="test", message="Admin's own log", user_id=admin_user.id))
    db_session.add(models.Log(type="test", message="Other user's log", user_id=99))
    db_session.commit()

    # Action
    response = client.get("/logs/")

    # Assertions
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) == 2
    messages = {log["message"] for log in logs}
    assert "Admin's own log" in messages
    assert "Other user's log" in messages